<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard/Index'))->name('dashboard');
    Route::get('/transactions', fn () => Inertia::render('Transactions/Index'))->name('transactions.index');
    Route::get('/categories', fn () => Inertia::render('Categories/Index'))->name('categories.index');
    Route::get('/budgets', fn () => Inertia::render('Budgets/Index'))->name('budgets.index');
    Route::get('/reports', fn () => Inertia::render('Reports/Index'))->name('reports.index');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
