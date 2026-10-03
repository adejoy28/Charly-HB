<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShopResource;
use App\Models\Shop;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ShopController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $shops = Shop::where('user_id', $request->user()->id)
            ->where('archived', false)
            ->orderBy('name')
            ->get();

        return $this->successResponse(
            ShopResource::collection($shops),
            'Shops retrieved successfully.'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $shop = Shop::create([
            'user_id' => $request->user()->id,
            'name'    => $validated['name'],
        ]);

        return $this->successResponse(
            new ShopResource($shop),
            'Shop created successfully.',
            Response::HTTP_CREATED
        );
    }

    public function update(Request $request, Shop $shop): JsonResponse
    {
        abort_if($shop->user_id !== $request->user()->id, Response::HTTP_FORBIDDEN);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $shop->update($validated);

        return $this->successResponse(
            new ShopResource($shop),
            'Shop updated successfully.'
        );
    }

    public function destroy(Request $request, Shop $shop): JsonResponse
    {
        abort_if($shop->user_id !== $request->user()->id, Response::HTTP_FORBIDDEN);

        $shop->update(['archived' => true]);

        return $this->successResponse(
            null,
            'Shop archived successfully.',
            Response::HTTP_NO_CONTENT
        );
    }
}
