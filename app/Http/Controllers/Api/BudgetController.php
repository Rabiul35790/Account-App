<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function index(): JsonResponse
    {
        $budgets = Budget::with('category')
            ->orderBy('start_date', 'desc')
            ->get();

        return response()->json($budgets);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'period' => 'required|in:monthly,quarterly,half_yearly,yearly',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        $validated['user_id'] = auth()->id();

        $budget = Budget::with('category')->create($validated);

        return response()->json($budget, 201);
    }

    public function update(Request $request, Budget $budget): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'amount' => 'sometimes|numeric|min:0.01',
            'period' => 'sometimes|in:monthly,quarterly,half_yearly,yearly',
            'start_date' => 'sometimes|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        $budget->update($validated);

        return response()->json($budget->load('category'));
    }

    public function destroy(Budget $budget): JsonResponse
    {
        $budget->delete();
        return response()->json(null, 204);
    }

    public function spending(): JsonResponse
    {
        $now = now();

        $budgets = Budget::with('category')
            ->where('start_date', '<=', $now)
            ->where(function ($q) use ($now) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', $now);
            })
            ->get()
            ->map(function ($budget) use ($now) {
                $query = \App\Models\Transaction::where('category_id', $budget->category_id)
                    ->where('type', 'expense');

                $query->where('date', '>=', $budget->start_date);

                $spent = $query->sum('amount');

                $budget->spent = (float) $spent;
                $budget->remaining = (float) ($budget->amount - $spent);
                $budget->percentage = $budget->amount > 0 ? round(($spent / $budget->amount) * 100, 1) : 0;

                return $budget;
            });

        return response()->json($budgets);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        Budget::whereIn('id', $ids)->get()->each->delete();
        return response()->json(['message' => 'Budgets deleted.']);
    }
}
