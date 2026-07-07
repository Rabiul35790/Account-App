<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecurringTransaction extends Model
{
    protected $fillable = [
        'user_id', 'category_id', 'type', 'amount', 'description',
        'frequency', 'next_date', 'end_date', 'is_active'
    ];

    protected function casts(): array
    {
        return [
            'next_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
            'amount' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
