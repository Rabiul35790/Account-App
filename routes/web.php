<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\TrashController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UsersController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/settings/logo', [SettingsController::class, 'logo']);

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard/Index'))->name('dashboard');
    Route::get('/transactions', fn () => Inertia::render('Transactions/Index'))->name('transactions.index');
    Route::get('/categories', fn () => Inertia::render('Categories/Index'))->name('categories.index');
    Route::get('/budgets', fn () => Inertia::render('Budgets/Index'))->name('budgets.index');
    Route::get('/reports', fn () => Inertia::render('Reports/Index'))->name('reports.index');
    Route::get('/trash', fn () => Inertia::render('Trash/Index'))->name('trash.index');

    // Data endpoints (session-based auth)
    Route::get('/api/dashboard/stats', [DashboardController::class, 'stats']);
    Route::post('/api/categories/bulk-delete', [CategoryController::class, 'bulkDestroy']);
    Route::apiResource('/api/categories', CategoryController::class);
    Route::post('/api/transactions/bulk-delete', [TransactionController::class, 'bulkDestroy']);
    Route::apiResource('/api/transactions', TransactionController::class);
    Route::get('/api/budgets/spending', [BudgetController::class, 'spending']);
    Route::post('/api/budgets/bulk-delete', [BudgetController::class, 'bulkDestroy']);
    Route::apiResource('/api/budgets', BudgetController::class);
    Route::get('/api/reports/summary', [ReportController::class, 'summary']);
    Route::get('/api/activity-logs', [ActivityLogController::class, 'index']);
    Route::get('/api/trash', [TrashController::class, 'index']);
    Route::post('/api/trash/restore/{type}/{id}', [TrashController::class, 'restore']);
    Route::delete('/api/trash/{type}/{id}', [TrashController::class, 'forceDelete']);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/settings', [SettingsController::class, 'edit'])->name('settings.edit');
    Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');


    Route::get('/users', [UsersController::class, 'index'])->name('users.index');
    Route::post('/users', [UsersController::class, 'store'])->name('users.store');
    Route::post('/users/bulk-delete', [UsersController::class, 'bulkDestroy'])->name('users.bulk-destroy');
    Route::delete('/users/{user}', [UsersController::class, 'destroy'])->name('users.destroy');
});

require __DIR__.'/auth.php';
