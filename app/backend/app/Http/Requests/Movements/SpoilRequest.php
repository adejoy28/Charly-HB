<?php

namespace App\Http\Requests\Movements;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SpoilRequest extends FormRequest
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
            'qty'        => ['required', 'integer', 'min:1', 'max:10000'],
            'reason'     => ['required', 'string', Rule::in(['damaged', 'expired', 'returned'])],
            'note'       => ['nullable', 'string', 'max:500'],
        ];
    }
}
