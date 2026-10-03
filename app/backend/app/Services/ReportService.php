<?php

namespace App\Services;

use App\Models\Movement;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ReportService
{
    /**
     * Resolve start and end timestamps based on period shortcut or custom dates.
     */
    public function resolveDateRange(?string $period = 'today', ?string $from = null, ?string $to = null): array
    {
        if ($from && $to) {
            return [
                'start' => Carbon::parse($from)->startOfDay(),
                'end'   => Carbon::parse($to)->endOfDay(),
            ];
        }

        $now = Carbon::now();

        $start = match ($period) {
            'today' => $now->copy()->startOfDay(),
            'week'  => $now->copy()->startOfWeek(),
            'month' => $now->copy()->startOfMonth(),
            'all'   => Carbon::createFromTimestamp(0),
            default => $now->copy()->startOfDay(),
        };

        return [
            'start' => $start,
            'end'   => $now->copy()->endOfDay(),
        ];
    }

    /**
     * Generate summary inventory metrics for the specified period.
     */
    public function getSummary(User $user, array $range, string $period = 'today'): array
    {
        $movements = Movement::where('user_id', $user->id)
            ->where('status', 'confirmed')
            ->where('recorded_at', '>=', $range['start'])
            ->where('recorded_at', '<=', $range['end'])
            ->get();

        $totalOpening     = (float) $movements->where('type', 'opening')->sum('qty');
        $totalReceived    = (float) $movements->where('type', 'receipt')->sum('qty');
        $totalDistributed = (float) abs($movements->where('type', 'distribution')->sum('qty'));
        $totalSpoiled     = (float) abs($movements->where('type', 'spoil')->sum('qty'));
        $totalCorrections = (float) $movements->where('type', 'correction')->sum('qty');

        $currentBalance = $totalOpening + $totalReceived - $totalDistributed - $totalSpoiled + $totalCorrections;

        return [
            'period'            => $period,
            'total_opening'     => $totalOpening,
            'total_received'    => $totalReceived,
            'total_distributed' => $totalDistributed,
            'total_spoiled'     => $totalSpoiled,
            'total_corrections' => $totalCorrections,
            'current_balance'   => $currentBalance,
        ];
    }

    /**
     * Generate distributions grouped by shop.
     */
    public function getByShop(User $user, array $range): array
    {
        $movements = Movement::with(['shop', 'product'])
            ->where('user_id', $user->id)
            ->where('status', 'confirmed')
            ->where('type', 'distribution')
            ->where('recorded_at', '>=', $range['start'])
            ->where('recorded_at', '<=', $range['end'])
            ->get()
            ->groupBy('shop_id');

        $result = [];

        foreach ($movements as $shopId => $shopMovements) {
            if (!$shopId) {
                continue;
            }

            $shop = $shopMovements->first()->shop;
            if (!$shop) {
                continue;
            }

            $totalDistributed = (float) abs($shopMovements->sum('qty'));

            $result[] = [
                'shop' => [
                    'id'   => $shop->id,
                    'name' => $shop->name,
                ],
                'total_distributed' => $totalDistributed,
                'movements'         => $shopMovements->values()->toArray(),
            ];
        }

        return $result;
    }

    /**
     * Generate inventory metrics grouped by product with margin calculations.
     */
    public function getByProduct(User $user, array $range): array
    {
        $movements = Movement::with('product')
            ->where('user_id', $user->id)
            ->where('status', 'confirmed')
            ->where('recorded_at', '>=', $range['start'])
            ->where('recorded_at', '<=', $range['end'])
            ->get()
            ->groupBy('product_id');

        $result = [];

        foreach ($movements as $productId => $productMovements) {
            $product = $productMovements->first()->product;
            if (!$product) {
                continue;
            }

            $opening     = (float) $productMovements->where('type', 'opening')->sum('qty');
            $received    = (float) $productMovements->where('type', 'receipt')->sum('qty');
            $distributed = (float) abs($productMovements->where('type', 'distribution')->sum('qty'));
            $spoiled     = (float) abs($productMovements->where('type', 'spoil')->sum('qty'));
            $corrections = (float) $productMovements->where('type', 'correction')->sum('qty');

            $periodBalance = $opening + $received - $distributed - $spoiled + $corrections;

            $distributionMovements = $productMovements->where('type', 'distribution');

            $totalSellingValue = (float) $distributionMovements
                ->filter(fn($m) => $m->selling_price !== null)
                ->sum(fn($m) => abs($m->qty) * (float) $m->selling_price);

            $totalCostValue = (float) $distributionMovements
                ->filter(fn($m) => $m->unit_cost !== null)
                ->sum(fn($m) => abs($m->qty) * (float) $m->unit_cost);

            $grossMargin = $totalSellingValue - $totalCostValue;

            $lastDistribution = $distributionMovements->sortByDesc('recorded_at')->first();

            $result[] = [
                'product' => [
                    'id'         => $product->id,
                    'name'       => $product->name,
                    'sku_code'   => $product->sku_code,
                    'cost_price' => (float) $product->cost_price,
                ],
                'opening'             => $opening,
                'received'            => $received,
                'distributed'         => $distributed,
                'spoiled'             => $spoiled,
                'corrections'         => $corrections,
                'period_balance'      => $periodBalance,
                'total_selling_value' => $totalSellingValue,
                'total_cost_value'    => $totalCostValue,
                'gross_margin'        => $grossMargin,
                'last_selling_price'  => $lastDistribution?->selling_price !== null ? (float) $lastDistribution->selling_price : null,
                'last_unit_cost'      => $lastDistribution?->unit_cost !== null ? (float) $lastDistribution->unit_cost : null,
            ];
        }

        return $result;
    }

    /**
     * Generate spoiled inventory breakdown by reason.
     */
    public function getSpoils(User $user, array $range): array
    {
        $movements = Movement::with('product')
            ->where('user_id', $user->id)
            ->where('status', 'confirmed')
            ->where('type', 'spoil')
            ->where('recorded_at', '>=', $range['start'])
            ->where('recorded_at', '<=', $range['end'])
            ->get()
            ->groupBy('product_id');

        $result = [];

        foreach ($movements as $productId => $productMovements) {
            $product = $productMovements->first()->product;
            if (!$product) {
                continue;
            }

            $damaged  = abs($productMovements->where('reason', 'damaged')->sum('qty'));
            $expired  = abs($productMovements->where('reason', 'expired')->sum('qty'));
            $returned = abs($productMovements->where('reason', 'returned')->sum('qty'));
            $total    = $damaged + $expired + $returned;

            $result[] = [
                'product' => [
                    'id'       => $product->id,
                    'name'     => $product->name,
                    'sku_code' => $product->sku_code,
                ],
                'damaged_qty'  => (float) $damaged,
                'expired_qty'  => (float) $expired,
                'returned_qty' => (float) $returned,
                'total'        => (float) $total,
            ];
        }

        return $result;
    }
}
