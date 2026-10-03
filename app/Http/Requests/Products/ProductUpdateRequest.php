<?php

namespace App\Http\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $product = $this->route('product');
        return $this->user() !== null && $product && $product->user_id === $this->user()->id;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;
        $productId = $this->route('product')?->id;

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('products')->where(fn ($query) => $query->where('user_id', $userId))->ignore($productId),
            ],
            'sku_code' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('products')->where(fn ($query) => $query->where('user_id', $userId))->ignore($productId),
            ],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
