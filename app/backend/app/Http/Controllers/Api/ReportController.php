<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        protected ReportService $reportService
    ) {}

    /**
     * Inventory summary report for the specified period.
     */
    public function summary(Request $request): JsonResponse
    {
        $period = $request->get('period', 'today');
        $range = $this->reportService->resolveDateRange($period, $request->get('from'), $request->get('to'));
        $data = $this->reportService->getSummary($request->user(), $range, $period);

        return $this->successResponse($data, 'Summary report retrieved successfully.');
    }

    /**
     * Distribution report grouped by shop.
     */
    public function byShop(Request $request): JsonResponse
    {
        $range = $this->reportService->resolveDateRange(
            $request->get('period', 'today'),
            $request->get('from'),
            $request->get('to')
        );
        $data = $this->reportService->getByShop($request->user(), $range);

        return $this->successResponse($data, 'By-shop report retrieved successfully.');
    }

    /**
     * Inventory metrics report grouped by product.
     */
    public function byProduct(Request $request): JsonResponse
    {
        $range = $this->reportService->resolveDateRange(
            $request->get('period', 'today'),
            $request->get('from'),
            $request->get('to')
        );
        $data = $this->reportService->getByProduct($request->user(), $range);

        return $this->successResponse($data, 'By-product report retrieved successfully.');
    }

    /**
     * Spoiled inventory breakdown report.
     */
    public function spoils(Request $request): JsonResponse
    {
        $range = $this->reportService->resolveDateRange(
            $request->get('period', 'today'),
            $request->get('from'),
            $request->get('to')
        );
        $data = $this->reportService->getSpoils($request->user(), $range);

        return $this->successResponse($data, 'Spoils report retrieved successfully.');
    }
}
