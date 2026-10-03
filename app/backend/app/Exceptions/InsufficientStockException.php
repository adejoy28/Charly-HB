<?php

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class InsufficientStockException extends HttpException
{
    public function __construct(string $productName, float|int $available, float|int $requested)
    {
        $message = "Insufficient stock for {$productName}. Available: {$available}, requested: {$requested}.";
        parent::__construct(409, $message);
    }
}
