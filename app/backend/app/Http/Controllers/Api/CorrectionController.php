<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Movements\CorrectionRequest;
use App\Http\Resources\MovementResource;
use App\Services\MovementService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class CorrectionController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        protected MovementService $movementService
    ) {}

    /**
     * Record inventory correction.
     */
    public function store(CorrectionRequest $request): JsonResponse
    {
        $movement = $this->movementService->recordCorrection(
            $request->user(),
            $request->validated()
        );

        return $this->successResponse(
            new MovementResource($movement),
            'Stock correction recorded successfully.',
            Response::HTTP_CREATED
        );
    }
}
