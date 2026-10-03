<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Movements\DistributionRequest;
use App\Http\Resources\MovementResource;
use App\Services\MovementService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class DistributionController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        protected MovementService $movementService
    ) {}

    /**
     * Record inventory distribution to a shop.
     */
    public function store(DistributionRequest $request): JsonResponse
    {
        $movements = $this->movementService->recordDistribution(
            $request->user(),
            $request->validated()
        );

        return $this->successResponse(
            MovementResource::collection($movements),
            'Distribution recorded successfully.',
            Response::HTTP_CREATED
        );
    }
}
