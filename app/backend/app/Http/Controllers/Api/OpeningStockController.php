<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Movements\OpeningStockRequest;
use App\Http\Resources\MovementResource;
use App\Services\MovementService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class OpeningStockController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        protected MovementService $movementService
    ) {}

    /**
     * Record daily opening stock for warehouse products.
     */
    public function store(OpeningStockRequest $request): JsonResponse
    {
        $movements = $this->movementService->recordOpeningStock(
            $request->user(),
            $request->validated('products')
        );

        return $this->successResponse(
            MovementResource::collection($movements),
            'Opening stock recorded successfully.',
            Response::HTTP_CREATED
        );
    }
}
