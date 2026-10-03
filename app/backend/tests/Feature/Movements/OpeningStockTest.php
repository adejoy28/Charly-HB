<?php

namespace Tests\Feature\Movements;

use App\Models\Movement;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OpeningStockTest extends TestCase
{
    use RefreshDatabase;

    public function test_opening_stock_succeeds_once_per_day(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $product = Product::create([
            'user_id'    => $user->id,
            'name'       => 'Morning Tea 250g',
            'sku_code'   => 'TEA-250',
            'cost_price' => 120.00,
        ]);

        $response = $this->postJson('/api/movements/opening', [
            'products' => [
                [
                    'product_id' => $product->id,
                    'qty'        => 40,
                ],
            ],
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'status'  => 'success',
            'message' => 'Opening stock recorded successfully.',
        ]);

        $this->assertEquals(40, $product->fresh()->balance());
        $this->assertDatabaseHas('movements', [
            'user_id'    => $user->id,
            'product_id' => $product->id,
            'type'       => 'opening',
            'qty'        => 40,
        ]);
    }

    public function test_opening_stock_cannot_be_recorded_twice_on_same_day(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $product = Product::create([
            'user_id'    => $user->id,
            'name'       => 'Morning Tea 250g',
            'sku_code'   => 'TEA-250',
            'cost_price' => 120.00,
        ]);

        // Pre-existing opening stock for today
        Movement::create([
            'user_id'     => $user->id,
            'product_id'  => $product->id,
            'type'        => 'opening',
            'qty'         => 30,
            'status'      => 'confirmed',
            'recorded_at' => now(),
        ]);

        $response = $this->postJson('/api/movements/opening', [
            'products' => [
                [
                    'product_id' => $product->id,
                    'qty'        => 50,
                ],
            ],
        ]);

        $response->assertStatus(409);
        $response->assertJson([
            'status'  => 'error',
            'message' => 'Opening stock already recorded today for Morning Tea 250g.',
        ]);

        // Stock remains 30, second attempt was not recorded
        $this->assertEquals(30, $product->fresh()->balance());
    }

    public function test_opening_stock_batch_rolls_back_completely_if_any_product_already_recorded(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $productFresh = Product::create([
            'user_id'    => $user->id,
            'name'       => 'Fresh Coffee',
            'sku_code'   => 'COF-100',
            'cost_price' => 300.00,
        ]);

        $productDuplicate = Product::create([
            'user_id'    => $user->id,
            'name'       => 'Already Recorded Sugar',
            'sku_code'   => 'SUG-500',
            'cost_price' => 100.00,
        ]);

        // Pre-record opening for Product B today
        Movement::create([
            'user_id'     => $user->id,
            'product_id'  => $productDuplicate->id,
            'type'        => 'opening',
            'qty'         => 20,
            'status'      => 'confirmed',
            'recorded_at' => now(),
        ]);

        // Attempt batch: ProductFresh (valid) + ProductDuplicate (conflict)
        $response = $this->postJson('/api/movements/opening', [
            'products' => [
                ['product_id' => $productFresh->id, 'qty' => 50],
                ['product_id' => $productDuplicate->id, 'qty' => 25],
            ],
        ]);

        $response->assertStatus(409);

        // Verification of bug fix: ProductFresh MUST NOT have any opening movement written
        $this->assertDatabaseMissing('movements', [
            'product_id' => $productFresh->id,
            'type'       => 'opening',
        ]);
        $this->assertEquals(0, $productFresh->fresh()->balance());
    }
}
