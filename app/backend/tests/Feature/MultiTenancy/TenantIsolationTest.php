<?php

namespace Tests\Feature\MultiTenancy;

use App\Models\Movement;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_access_or_view_other_users_products(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $productA = Product::create([
            'user_id'    => $userA->id,
            'name'       => "User A's Product",
            'sku_code'   => 'SKU-A-01',
            'cost_price' => 10.00,
        ]);

        $productB = Product::create([
            'user_id'    => $userB->id,
            'name'       => "User B's Product",
            'sku_code'   => 'SKU-B-01',
            'cost_price' => 20.00,
        ]);

        Sanctum::actingAs($userA);

        $response = $this->getJson('/api/products');
        $response->assertStatus(200);

        $data = $response->json('data');
        $productNames = collect($data)->pluck('name')->toArray();

        $this->assertContains("User A's Product", $productNames);
        $this->assertNotContains("User B's Product", $productNames);

        // Attempt direct access via show
        $showResponse = $this->getJson("/api/products/{$productB->id}");
        $showResponse->assertStatus(403);
    }

    public function test_user_cannot_distribute_to_other_users_shop(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $productA = Product::create([
            'user_id'    => $userA->id,
            'name'       => 'Product A',
            'sku_code'   => 'SKU-A',
            'cost_price' => 10.00,
        ]);

        Movement::create([
            'user_id'     => $userA->id,
            'product_id'  => $productA->id,
            'type'        => 'receipt',
            'qty'         => 100,
            'status'      => 'confirmed',
            'recorded_at' => now(),
        ]);

        $shopB = Shop::create([
            'user_id'  => $userB->id,
            'name'     => "User B's Store",
            'archived' => false,
        ]);

        Sanctum::actingAs($userA);

        // User A tries to distribute to User B's shop
        $response = $this->postJson('/api/movements/distribution', [
            'shop_id'  => $shopB->id,
            'products' => [
                ['product_id' => $productA->id, 'qty' => 5],
            ],
        ]);

        // FormRequest exists validation fails because shop_id is not owned by userA
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['shop_id']);
    }

    public function test_user_cannot_distribute_other_users_product(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $shopA = Shop::create([
            'user_id'  => $userA->id,
            'name'     => "User A's Shop",
            'archived' => false,
        ]);

        $productB = Product::create([
            'user_id'    => $userB->id,
            'name'       => "User B's High Value Item",
            'sku_code'   => 'SKU-B-HV',
            'cost_price' => 500.00,
        ]);

        Movement::create([
            'user_id'     => $userB->id,
            'product_id'  => $productB->id,
            'type'        => 'receipt',
            'qty'         => 100,
            'status'      => 'confirmed',
            'recorded_at' => now(),
        ]);

        Sanctum::actingAs($userA);

        // User A tries to distribute User B's product
        $response = $this->postJson('/api/movements/distribution', [
            'shop_id'  => $shopA->id,
            'products' => [
                ['product_id' => $productB->id, 'qty' => 10],
            ],
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['products.0.product_id']);
    }
}
