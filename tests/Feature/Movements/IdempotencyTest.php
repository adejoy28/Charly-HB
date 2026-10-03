<?php

namespace Tests\Feature\Movements;

use App\Models\Movement;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IdempotencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_duplicate_request_with_same_idempotency_key_is_replayed_without_duplicate_writes(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $shop = Shop::create([
            'user_id'  => $user->id,
            'name'     => 'Store Alpha',
            'archived' => false,
        ]);

        $product = Product::create([
            'user_id'    => $user->id,
            'name'       => 'Snack Pack',
            'sku_code'   => 'SNK-01',
            'cost_price' => 50.00,
        ]);

        Movement::create([
            'user_id'     => $user->id,
            'product_id'  => $product->id,
            'type'        => 'receipt',
            'qty'         => 100,
            'status'      => 'confirmed',
            'recorded_at' => now(),
        ]);

        $idempotencyKey = (string) Str::uuid();

        $payload = [
            'shop_id'  => $shop->id,
            'products' => [
                ['product_id' => $product->id, 'qty' => 10],
            ],
        ];

        // First execution
        $response1 = $this->withHeader('X-Idempotency-Key', $idempotencyKey)
            ->postJson('/api/movements/distribution', $payload);

        $response1->assertStatus(201);
        $this->assertEquals(90, $product->fresh()->balance());

        // Second execution with identical key (simulating retry from mobile app)
        $response2 = $this->withHeader('X-Idempotency-Key', $idempotencyKey)
            ->postJson('/api/movements/distribution', $payload);

        $response2->assertStatus(201);
        $response2->assertHeader('X-Idempotent-Replayed', 'true');

        // Critical verification: Stock was deducted ONLY ONCE (remains 90, not 80)
        $this->assertEquals(90, $product->fresh()->balance());
        $this->assertEquals(1, Movement::where('type', 'distribution')->count());
    }
}
