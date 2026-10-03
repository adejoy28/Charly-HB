<?php

namespace Tests\Feature\Movements;

use App\Models\Movement;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DistributionTest extends TestCase
{
    use RefreshDatabase;

    public function test_distribution_deducts_stock_and_records_pricing(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $shop = Shop::create([
            'user_id'  => $user->id,
            'name'     => 'Main Downtown Shop',
            'archived' => false,
        ]);

        $product = Product::create([
            'user_id'    => $user->id,
            'name'       => 'Cola 50cl',
            'sku_code'   => 'COLA-050',
            'cost_price' => 200.00,
        ]);

        // Seed initial warehouse receipt of 50 units
        Movement::create([
            'user_id'     => $user->id,
            'product_id'  => $product->id,
            'type'        => 'receipt',
            'qty'         => 50,
            'status'      => 'confirmed',
            'recorded_at' => now(),
        ]);

        $response = $this->postJson('/api/movements/distribution', [
            'shop_id'  => $shop->id,
            'products' => [
                [
                    'product_id'    => $product->id,
                    'qty'           => 15,
                    'selling_price' => 250.00,
                ],
            ],
            'note' => 'Morning shop delivery',
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'status'  => 'success',
            'message' => 'Distribution recorded successfully.',
        ]);

        // Balance should now be 50 - 15 = 35
        $this->assertEquals(35, $product->fresh()->balance());

        $this->assertDatabaseHas('movements', [
            'user_id'       => $user->id,
            'product_id'    => $product->id,
            'shop_id'       => $shop->id,
            'type'          => 'distribution',
            'qty'           => -15,
            'selling_price' => 250.00,
            'unit_cost'     => 200.00,
        ]);
    }

    public function test_distribution_fails_with_409_when_stock_is_insufficient(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $shop = Shop::create([
            'user_id'  => $user->id,
            'name'     => 'Uptown Store',
            'archived' => false,
        ]);

        $product = Product::create([
            'user_id'    => $user->id,
            'name'       => 'Juice 1L',
            'sku_code'   => 'JUC-100',
            'cost_price' => 150.00,
        ]);

        // Stock is only 10 units
        Movement::create([
            'user_id'     => $user->id,
            'product_id'  => $product->id,
            'type'        => 'receipt',
            'qty'         => 10,
            'status'      => 'confirmed',
            'recorded_at' => now(),
        ]);

        // Attempting to distribute 25 units
        $response = $this->postJson('/api/movements/distribution', [
            'shop_id'  => $shop->id,
            'products' => [
                [
                    'product_id' => $product->id,
                    'qty'        => 25,
                ],
            ],
        ]);

        $response->assertStatus(409);
        $response->assertJson([
            'status' => 'error',
        ]);
        $response->assertJsonFragment([
            'message' => 'Insufficient stock for Juice 1L. Available: 10, requested: 25.',
        ]);

        // Balance remains unchanged at 10
        $this->assertEquals(10, $product->fresh()->balance());
    }

    public function test_distribution_rolls_back_completely_on_multi_product_partial_failure(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $shop = Shop::create([
            'user_id'  => $user->id,
            'name'     => 'Central Hub',
            'archived' => false,
        ]);

        $productA = Product::create([
            'user_id'    => $user->id,
            'name'       => 'Product A',
            'sku_code'   => 'SKU-A',
            'cost_price' => 100.00,
        ]);

        $productB = Product::create([
            'user_id'    => $user->id,
            'name'       => 'Product B',
            'sku_code'   => 'SKU-B',
            'cost_price' => 100.00,
        ]);

        // Product A has 50 units, Product B has only 5 units
        Movement::create([
            'user_id'     => $user->id,
            'product_id'  => $productA->id,
            'type'        => 'receipt',
            'qty'         => 50,
            'status'      => 'confirmed',
            'recorded_at' => now(),
        ]);
        Movement::create([
            'user_id'     => $user->id,
            'product_id'  => $productB->id,
            'type'        => 'receipt',
            'qty'         => 5,
            'status'      => 'confirmed',
            'recorded_at' => now(),
        ]);

        // Attempt batch distribution: Product A requests 10 (valid), Product B requests 20 (invalid)
        $response = $this->postJson('/api/movements/distribution', [
            'shop_id'  => $shop->id,
            'products' => [
                ['product_id' => $productA->id, 'qty' => 10],
                ['product_id' => $productB->id, 'qty' => 20],
            ],
        ]);

        $response->assertStatus(409);

        // Verification of atomic rollback: Product A distribution MUST NOT exist
        $this->assertDatabaseMissing('movements', [
            'product_id' => $productA->id,
            'type'       => 'distribution',
        ]);
        $this->assertEquals(50, $productA->fresh()->balance());
        $this->assertEquals(5, $productB->fresh()->balance());
    }
}
