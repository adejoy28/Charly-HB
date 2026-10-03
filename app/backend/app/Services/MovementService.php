<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Exceptions\OpeningStockAlreadyRecordedException;
use App\Models\Movement;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class MovementService
{
    /**
     * Record a goods distribution to a shop.
     * Wrapped in a database transaction with pessimistic locking to prevent stock over-distribution.
     */
    public function recordDistribution(User $user, array $validated): Collection
    {
        return DB::transaction(function () use ($user, $validated) {
            $shop = Shop::where('id', $validated['shop_id'])
                ->where('user_id', $user->id)
                ->where('archived', false)
                ->first();

            if (!$shop) {
                throw new NotFoundHttpException('Shop not found or archived.');
            }

            $movements = collect();

            foreach ($validated['products'] as $item) {
                /** @var Product|null $product */
                $product = Product::where('id', $item['product_id'])
                    ->where('user_id', $user->id)
                    ->lockForUpdate()
                    ->first();

                if (!$product) {
                    throw new NotFoundHttpException("Product ID {$item['product_id']} not found.");
                }

                $currentBalance = $product->balance();

                if ($currentBalance < $item['qty']) {
                    throw new InsufficientStockException($product->name, $currentBalance, $item['qty']);
                }

                $unitCost = $product->cost_price !== null ? (float) $product->cost_price : null;
                $sellingPrice = isset($item['selling_price']) && $item['selling_price'] !== null
                    ? (float) $item['selling_price']
                    : $unitCost;

                $movement = Movement::create([
                    'user_id'       => $user->id,
                    'product_id'    => $product->id,
                    'type'          => 'distribution',
                    'qty'           => -$item['qty'],
                    'shop_id'       => $shop->id,
                    'status'        => 'confirmed',
                    'note'          => $validated['note'] ?? null,
                    'unit_cost'     => $unitCost,
                    'selling_price' => $sellingPrice,
                    'recorded_at'   => now(),
                    'recorded_by'   => $user->name,
                ]);

                $movements->push($movement);
            }

            return $movements;
        });
    }

    /**
     * Record opening stock for the day.
     * Fully atomic: checks for existing daily opening stock across all items before committing any writes.
     */
    public function recordOpeningStock(User $user, array $products): Collection
    {
        return DB::transaction(function () use ($user, $products) {
            $today = Carbon::today();
            $movements = collect();

            // Pre-validation pass: Verify no opening stock recorded today for ANY product in payload
            foreach ($products as $item) {
                $product = Product::where('id', $item['product_id'])
                    ->where('user_id', $user->id)
                    ->first();

                if (!$product) {
                    throw new NotFoundHttpException("Product ID {$item['product_id']} not found.");
                }

                $alreadyRecorded = Movement::where('product_id', $product->id)
                    ->where('user_id', $user->id)
                    ->where('type', 'opening')
                    ->whereDate('recorded_at', $today)
                    ->exists();

                if ($alreadyRecorded) {
                    throw new OpeningStockAlreadyRecordedException($product->name);
                }
            }

            // Persistence pass: Commit movements
            foreach ($products as $item) {
                if ($item['qty'] === 0) {
                    continue;
                }

                $movement = Movement::create([
                    'user_id'     => $user->id,
                    'product_id'  => $item['product_id'],
                    'type'        => 'opening',
                    'qty'         => $item['qty'],
                    'status'      => 'confirmed',
                    'recorded_at' => now(),
                    'recorded_by' => $user->name,
                ]);

                $movements->push($movement);
            }

            return $movements;
        });
    }

    /**
     * Record receipt of goods into the warehouse.
     */
    public function recordReceipt(User $user, array $validated): Collection
    {
        return DB::transaction(function () use ($user, $validated) {
            $movements = collect();

            foreach ($validated['products'] as $item) {
                $product = Product::where('id', $item['product_id'])
                    ->where('user_id', $user->id)
                    ->first();

                if (!$product) {
                    throw new NotFoundHttpException("Product ID {$item['product_id']} not found.");
                }

                $movement = Movement::create([
                    'user_id'     => $user->id,
                    'product_id'  => $product->id,
                    'type'        => 'receipt',
                    'qty'         => $item['qty'],
                    'status'      => 'confirmed',
                    'note'        => $validated['note'] ?? null,
                    'unit_cost'   => $product->cost_price !== null ? (float) $product->cost_price : null,
                    'recorded_at' => now(),
                    'recorded_by' => $user->name,
                ]);

                $movements->push($movement);
            }

            return $movements;
        });
    }

    /**
     * Record an inventory correction (positive or negative).
     */
    public function recordCorrection(User $user, array $validated): Movement
    {
        return DB::transaction(function () use ($user, $validated) {
            $product = Product::where('id', $validated['product_id'])
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            if (!$product) {
                throw new NotFoundHttpException('Product not found.');
            }

            // If negative correction, ensure stock will not become negative
            if ($validated['qty'] < 0) {
                $currentBalance = $product->balance();
                $requestedDeduction = abs($validated['qty']);
                if ($currentBalance < $requestedDeduction) {
                    throw new InsufficientStockException($product->name, $currentBalance, $requestedDeduction);
                }
            }

            return Movement::create([
                'user_id'     => $user->id,
                'product_id'  => $product->id,
                'type'        => 'correction',
                'qty'         => $validated['qty'],
                'shop_id'     => $validated['shop_id'] ?? null,
                'status'      => 'confirmed',
                'note'        => $validated['note'],
                'unit_cost'   => $product->cost_price !== null ? (float) $product->cost_price : null,
                'recorded_at' => now(),
                'recorded_by' => $user->name,
            ]);
        });
    }

    /**
     * Record a pending spoil entry.
     */
    public function recordSpoil(User $user, array $validated): Movement
    {
        $product = Product::where('id', $validated['product_id'])
            ->where('user_id', $user->id)
            ->first();

        if (!$product) {
            throw new NotFoundHttpException('Product not found.');
        }

        return Movement::create([
            'user_id'     => $user->id,
            'product_id'  => $product->id,
            'type'        => 'spoil',
            'qty'         => -abs($validated['qty']),
            'reason'      => $validated['reason'],
            'status'      => 'pending',
            'note'        => $validated['note'] ?? null,
            'unit_cost'   => $product->cost_price !== null ? (float) $product->cost_price : null,
            'recorded_at' => now(),
            'recorded_by' => $user->name,
        ]);
    }

    /**
     * Confirm a pending spoil, applying deduction to warehouse balance.
     */
    public function confirmSpoil(User $user, int $movementId): Movement
    {
        return DB::transaction(function () use ($user, $movementId) {
            $movement = Movement::where('id', $movementId)
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            if (!$movement) {
                throw new NotFoundHttpException('Spoil record not found.');
            }

            if ($movement->type !== 'spoil' || $movement->status !== 'pending') {
                throw new BadRequestHttpException('Only pending spoils can be confirmed.');
            }

            $product = Product::where('id', $movement->product_id)
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            if (!$product) {
                throw new NotFoundHttpException('Product not found.');
            }

            $currentBalance = $product->balance();
            $spoilQty = abs($movement->qty);

            if ($currentBalance < $spoilQty) {
                throw new InsufficientStockException($product->name, $currentBalance, $spoilQty);
            }

            $movement->update(['status' => 'confirmed']);

            return $movement->fresh(['product', 'shop']);
        });
    }

    /**
     * Reject a pending spoil.
     */
    public function rejectSpoil(User $user, int $movementId): Movement
    {
        $movement = Movement::where('id', $movementId)
            ->where('user_id', $user->id)
            ->first();

        if (!$movement) {
            throw new NotFoundHttpException('Spoil record not found.');
        }

        if ($movement->type !== 'spoil' || $movement->status !== 'pending') {
            throw new BadRequestHttpException('Only pending spoils can be rejected.');
        }

        $movement->update(['status' => 'rejected']);

        return $movement->fresh(['product', 'shop']);
    }
}
