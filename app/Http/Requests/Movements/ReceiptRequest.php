<?php

namespace App\Http\Requests\Movements;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'products'              => ['required', 'array', 'min:1'],
            'products.*.product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
            'products.*.qty'        => ['required', 'integer', 'min:1', 'max:10000'],
            'note'                  => ['nullable', 'string', 'max:500'],
        ];
    }
}
