<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Movements\SpoilRequest;
use App\Http\Resources\MovementResource;
use App\Services\MovementService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SpoilController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        protected MovementService $movementService
    ) {}

    /**
     * Record a pending spoil entry.
     */
    public function store(SpoilRequest $request): JsonResponse
    {
        $movement = $this->movementService->recordSpoil(
            $request->user(),
            $request->validated()
        );

        return $this->successResponse(
            new MovementResource($movement),
            'Spoil recorded successfully.',
            Response::HTTP_CREATED
        );
    }

    /**
     * Confirm a pending spoil entry.
     */
    public function confirm(Request $request, int $id): JsonResponse
    {
        $movement = $this->movementService->confirmSpoil($request->user(), $id);

        return $this->successResponse(
            new MovementResource($movement),
            'Spoil confirmed successfully.'
        );
    }

    /**
     * Reject a pending spoil entry.
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $movement = $this->movementService->rejectSpoil($request->user(), $id);

        return $this->successResponse(
            new MovementResource($movement),
            'Spoil rejected successfully.'
        );
    }
}
