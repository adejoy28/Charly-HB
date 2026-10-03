<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    protected $fillable = ['name', 'sku_code', 'cost_price', 'user_id'];

    public function getBalanceAttribute(): float
    {
        if (array_key_exists('balance', $this->attributes)) {
            return (float) $this->attributes['balance'];
        }

        return (float) $this->movements()
            ->where('status', 'confirmed')
            ->sum('qty');
    }

    public function balance(): float
    {
        return $this->getBalanceAttribute();
    }

    public function movements(): HasMany
    {
        return $this->hasMany(Movement::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
