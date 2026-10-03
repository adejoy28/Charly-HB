<?php

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class OpeningStockAlreadyRecordedException extends HttpException
{
    public function __construct(string $productName)
    {
        parent::__construct(409, "Opening stock already recorded today for {$productName}.");
    }
}
