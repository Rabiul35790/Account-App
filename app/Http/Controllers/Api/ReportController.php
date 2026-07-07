<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $year = $request->year ?? now()->year;

        $monthlyData = Transaction::whereYear('date', $year)
            ->select(
                DB::raw("DATE_FORMAT(date, '%Y-%m') as month"),
                DB::raw("SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income"),
                DB::raw("SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense")
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $totalIncome = $monthlyData->sum('income');
        $totalExpense = $monthlyData->sum('expense');

        $categoryBreakdown = Transaction::whereYear('date', $year)
            ->where('type', $request->type ?? 'expense')
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->groupBy('category_id')
            ->with('category')
            ->get();

        return response()->json([
            'year' => $year,
            'total_income' => (float) $totalIncome,
            'total_expense' => (float) $totalExpense,
            'net' => (float) ($totalIncome - $totalExpense),
            'monthly' => $monthlyData,
            'category_breakdown' => $categoryBreakdown,
        ]);
    }
}
