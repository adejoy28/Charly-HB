<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\ProductStoreRequest;
use App\Http\Requests\Products\ProductUpdateRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ProductController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        protected ProductService $productService
    ) {}

    /**
     * List all products with pre-computed balance.
     */
    public function index(Request $request): JsonResponse
    {
        $products = $this->productService->getProductsWithBalance($request->user()->id);

        return $this->successResponse(
            ProductResource::collection($products),
            'Products retrieved successfully.'
        );
    }

    /**
     * Store a newly created product.
     */
    public function store(ProductStoreRequest $request): JsonResponse
    {
        $product = $this->productService->createProduct(
            $request->user(),
            $request->validated()
        );

        return $this->successResponse(
            new ProductResource($product),
            'Product created successfully.',
            Response::HTTP_CREATED
        );
    }

    /**
     * Display the specified product.
     */
    public function show(Request $request, Product $product): JsonResponse
    {
        abort_if($product->user_id !== $request->user()->id, Response::HTTP_FORBIDDEN);

        $loadedProduct = $this->productService->getProductWithBalance($request->user()->id, $product->id);

        return $this->successResponse(
            new ProductResource($loadedProduct),
            'Product retrieved successfully.'
        );
    }

    /**
     * Update the specified product.
     */
    public function update(ProductUpdateRequest $request, Product $product): JsonResponse
    {
        $updatedProduct = $this->productService->updateProduct($product, $request->validated());

        return $this->successResponse(
            new ProductResource($updatedProduct),
            'Product updated successfully.'
        );
    }

    /**
     * Remove the specified product.
     */
    public function destroy(Request $request, Product $product): JsonResponse
    {
        abort_if($product->user_id !== $request->user()->id, Response::HTTP_FORBIDDEN);

        $this->productService->deleteProduct($product);

        return $this->successResponse(
            null,
            'Product deleted successfully.',
            Response::HTTP_NO_CONTENT
        );
    }
}
