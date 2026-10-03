<?php

namespace Tests\Feature\Products;

use App\Models\Movement;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_product_with_tenant_scoped_sku(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        Sanctum::actingAs($userA);

        $responseA = $this->postJson('/api/products', [
            'name'       => 'Widget A',
            'sku_code'   => 'WIDGET-01',
            'cost_price' => 50.00,
        ]);

        $responseA->assertStatus(201);
        $responseA->assertJson([
            'status' => 'success',
            'data'   => [
                'name'       => 'Widget A',
                'sku_code'   => 'WIDGET-01',
                'cost_price' => 50.00,
                'balance'    => 0,
            ],
        ]);

        // Cannot reuse the same SKU
        $responseDuplicate = $this->postJson('/api/products', [
            'name'       => 'Widget Duplicate',
            'sku_code'   => 'WIDGET-01',
            'cost_price' => 50.00,
        ]);

        $responseDuplicate->assertStatus(422);
        $responseDuplicate->assertJsonValidationErrors(['sku_code']);
    }

    public function test_product_index_returns_aggregated_balances_accurately(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $product = Product::create([
            'user_id'    => $user->id,
            'name'       => 'Item X',
            'sku_code'   => 'ITEM-X',
            'cost_price' => 100.00,
        ]);

        Movement::create([
            'user_id'     => $user->id,
            'product_id'  => $product->id,
            'type'        => 'receipt',
            'qty'         => 80,
            'status'      => 'confirmed',
            'recorded_at' => now(),
        ]);

        Movement::create([
            'user_id'     => $user->id,
            'product_id'  => $product->id,
            'type'        => 'distribution',
            'qty'         => -30,
            'status'      => 'confirmed',
            'recorded_at' => now(),
        ]);

        // Pending spoil must NOT affect the confirmed balance
        Movement::create([
            'user_id'     => $user->id,
            'product_id'  => $product->id,
            'type'        => 'spoil',
            'qty'         => -10,
            'status'      => 'pending',
            'recorded_at' => now(),
        ]);

        $response = $this->getJson('/api/products');
        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        // Expected balance: 80 - 30 = 50
        $this->assertEquals(50, $data[0]['balance']);
    }
}
