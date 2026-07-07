<?php

namespace App\Traits;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    public static function bootAuditable(): void
    {
        static::creating(function ($model) {
            if (Auth::check()) {
                $model->created_by = Auth::id();
                $model->updated_by = Auth::id();
            }
        });

        static::updating(function ($model) {
            if (Auth::check() && !$model->isDirty('deleted_by')) {
                $model->updated_by = Auth::id();
            }
        });

        static::deleting(function ($model) {
            if (Auth::check() && !$model->isForceDeleting()) {
                $model->deleted_by = Auth::id();
                $model->save();
            }
        });

        static::created(function ($model) {
            static::logActivity($model, 'created');
        });

        static::updated(function ($model) {
            if (!$model->isDirty('deleted_by')) {
                static::logActivity($model, 'updated');
            }
        });

        static::deleted(function ($model) {
            if (!$model->isForceDeleting()) {
                static::logActivity($model, 'deleted');
            }
        });

        static::restored(function ($model) {
            if (Auth::check()) {
                $model->updated_by = Auth::id();
                $model->deleted_by = null;
                $model->save();
            }
            static::logActivity($model, 'restored');
        });
    }

    protected static function logActivity($model, string $event): void
    {
        if (!Auth::check()) return;

        $old = $model->getOriginal();
        $new = $model->getAttributes();

        if ($event === 'created') {
            $old = null;
        } elseif ($event === 'deleted') {
            $new = null;
        }

        ActivityLog::create([
            'subject_type' => get_class($model),
            'subject_id' => $model->id,
            'event' => $event,
            'user_id' => Auth::id(),
            'old_values' => $old,
            'new_values' => $new,
        ]);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function deletedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    public function activityLogs(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(ActivityLog::class, 'subject');
    }
}
