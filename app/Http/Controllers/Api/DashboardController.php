<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\Budget;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $userId = auth()->id();
        $now = now();
        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfMonth();

        $monthlyIncome = Transaction::where('user_id', $userId)
            ->where('type', 'income')
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->sum('amount');

        $monthlyExpense = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->sum('amount');

        $balance = Transaction::where('user_id', $userId)
            ->selectRaw("SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as balance")
            ->value('balance');

        $recentTransactions = Transaction::with('category')
            ->where('user_id', $userId)
            ->latest('date')
            ->limit(10)
            ->get();

        $expenseByCategory = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->groupBy('category_id')
            ->with('category')
            ->get();

        $monthlyTrend = Transaction::where('user_id', $userId)
            ->select(
                DB::raw("DATE_FORMAT(date, '%Y-%m') as month"),
                DB::raw("SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income"),
                DB::raw("SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense")
            )
            ->where('date', '>=', $now->copy()->subMonths(6)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'monthly_income' => (float) $monthlyIncome,
            'monthly_expense' => (float) $monthlyExpense,
            'balance' => (float) ($balance ?? 0),
            'recent_transactions' => $recentTransactions,
            'expense_by_category' => $expenseByCategory,
            'monthly_trend' => $monthlyTrend,
        ]);
    }
}
