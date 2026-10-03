<?php

namespace App\Services;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProductService
{
    /**
     * Retrieve all products for a user with eager-loaded aggregate balance (eliminating N+1 queries).
     */
    public function getProductsWithBalance(int $userId): Collection
    {
        return Product::where('user_id', $userId)
            ->withSum(['movements as balance' => function ($query) {
                $query->where('status', 'confirmed');
            }], 'qty')
            ->orderBy('name')
            ->get();
    }

    /**
     * Retrieve a single product with calculated balance.
     */
    public function getProductWithBalance(int $userId, int $productId): Product
    {
        $product = Product::where('id', $productId)
            ->where('user_id', $userId)
            ->withSum(['movements as balance' => function ($query) {
                $query->where('status', 'confirmed');
            }], 'qty')
            ->first();

        if (!$product) {
            throw new NotFoundHttpException('Product not found.');
        }

        return $product;
    }

    /**
     * Create a new product scoped to the user.
     */
    public function createProduct(User $user, array $validated): Product
    {
        return Product::create([
            'user_id'    => $user->id,
            'name'       => $validated['name'],
            'sku_code'   => $validated['sku_code'],
            'cost_price' => $validated['cost_price'] ?? null,
        ]);
    }

    /**
     * Update an existing product.
     */
    public function updateProduct(Product $product, array $validated): Product
    {
        $product->update($validated);
        return $product;
    }

    /**
     * Safely delete a product, preventing deletion if movements exist.
     */
    public function deleteProduct(Product $product): void
    {
        if ($product->movements()->exists()) {
            throw new ConflictHttpException('Cannot delete a product with existing movements.');
        }

        $product->delete();
    }
}
