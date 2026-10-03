<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MovementResource;
use App\Models\Movement;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MovementController extends Controller
{
    use ApiResponseTrait;

    /**
     * List movements with pagination and filters.
     */
    public function index(Request $request): JsonResponse
    {
        $limit = min((int) $request->get('limit', 20), 50);

        $query = Movement::with(['product', 'shop'])
            ->where('movements.user_id', $request->user()->id);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }
        if ($request->filled('shop_id')) {
            $query->where('shop_id', $request->shop_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('from')) {
            $query->whereDate('recorded_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('recorded_at', '<=', $request->to);
        }

        $movements = $query
            ->orderBy('recorded_at', 'desc')
            ->paginate($limit);

        return $this->successResponse(
            MovementResource::collection($movements->items()),
            'Movements retrieved successfully.',
            200,
            [
                'current_page' => $movements->currentPage(),
                'last_page'    => $movements->lastPage(),
                'per_page'     => $movements->perPage(),
                'total'        => $movements->total(),
                'has_more'     => $movements->hasMorePages(),
            ]
        );
    }
}
