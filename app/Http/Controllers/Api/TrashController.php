<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;

class TrashController extends Controller
{
    public function index(): JsonResponse
    {
        $transactions = Transaction::onlyTrashed()->with(['category', 'deletedBy:id,name'])->get();
        $categories = Category::onlyTrashed()->with(['deletedBy:id,name'])->get();
        $budgets = Budget::onlyTrashed()->with(['category', 'deletedBy:id,name'])->get();

        return response()->json([
            'transactions' => $transactions,
            'categories' => $categories,
            'budgets' => $budgets,
        ]);
    }

    public function restore(string $type, int $id): JsonResponse
    {
        $model = match ($type) {
            'transaction' => Transaction::onlyTrashed()->findOrFail($id),
            'category' => Category::onlyTrashed()->findOrFail($id),
            'budget' => Budget::onlyTrashed()->findOrFail($id),
            default => abort(404),
        };

        $model->restore();

        return response()->json(['message' => 'Restored successfully.']);
    }

    public function forceDelete(string $type, int $id): JsonResponse
    {
        $model = match ($type) {
            'transaction' => Transaction::onlyTrashed()->findOrFail($id),
            'category' => Category::onlyTrashed()->findOrFail($id),
            'budget' => Budget::onlyTrashed()->findOrFail($id),
            default => abort(404),
        };

        $model->forceDelete();

        return response()->json(['message' => 'Permanently deleted.']);
    }
}
