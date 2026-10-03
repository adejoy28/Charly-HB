<?php

namespace App\Http\Requests\Movements;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CorrectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
            'qty'        => ['required', 'integer', 'not_in:0', 'min:-10000', 'max:10000'],
            'shop_id'    => [
                'nullable',
                'integer',
                Rule::exists('shops', 'id')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
            'note'       => ['required', 'string', 'min:3', 'max:500'],
        ];
    }
}
