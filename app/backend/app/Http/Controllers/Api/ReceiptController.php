<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Movements\ReceiptRequest;
use App\Http\Resources\MovementResource;
use App\Services\MovementService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class ReceiptController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        protected MovementService $movementService
    ) {}

    /**
     * Record goods receipt into the warehouse.
     */
    public function store(ReceiptRequest $request): JsonResponse
    {
        $movements = $this->movementService->recordReceipt(
            $request->user(),
            $request->validated()
        );

        return $this->successResponse(
            MovementResource::collection($movements),
            'Goods receipt recorded successfully.',
            Response::HTTP_CREATED
        );
    }
}
