<?php

namespace App\Http\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
            'sku_code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
