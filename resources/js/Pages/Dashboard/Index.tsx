import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { DashboardStats, Category } from '@/types';
import Modal from '@/Components/ui/Modal';
import TransactionForm from '@/Components/ui/TransactionForm';
import { formatCurrency } from '@/lib/currency';

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/dashboard/stats');
            const data = await res.json();
            setStats(data);
        } catch (e) {
            console.error('Failed to fetch stats', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data);
        } catch (e) {
            console.error('Failed to fetch categories', e);
        }
    };

    useEffect(() => { fetchStats(); fetchCategories(); }, []);

    const handleAddTransaction = async (data: any) => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                setShowAddTransaction(false);
                fetchStats();
            }
        } catch (e) {
            console.error('Failed to save transaction', e);
        } finally {
            setSubmitting(false);
        }
    };

    const StatCard = ({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) => {
        const colors: Record<string, string> = {
            indigo: 'from-indigo-500 to-indigo-600',
            emerald: 'from-emerald-500 to-emerald-600',
            rose: 'from-rose-500 to-rose-600',
            amber: 'from-amber-500 to-amber-600',
            blue: 'from-blue-500 to-blue-600',
        };
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
                        <p className={`text-xl font-bold mt-1.5 ${value >= 0 ? 'text-gray-900' : 'text-rose-600'}`}>
                            {formatCurrency(value)}
                        </p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color] || colors.indigo} text-white shadow-lg shadow-${color}-500/20`}>
                        {icon}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-sm text-gray-400 mt-1">Your financial overview at a glance</p>
                    </div>
                    <button onClick={() => setShowAddTransaction(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Transaction
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <StatCard label="Total Balance" value={stats?.balance || 0} color="indigo"
                                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                            <StatCard label="Monthly Income" value={stats?.monthly_income || 0} color="emerald"
                                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                            <StatCard label="Monthly Expenses" value={stats?.monthly_expense || 0} color="rose"
                                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} />
                            <StatCard label="Net Profit" value={(stats?.monthly_income || 0) - (stats?.monthly_expense || 0)} color="amber"
                                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Transactions</h2>
                                {stats?.recent_transactions?.length ? (
                                    <div className="space-y-1">
                                        {stats.recent_transactions.map((tx) => (
                                            <div key={tx.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${tx.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            {tx.category && (
                                                                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tx.category.color }} />
                                                                    {tx.category.name}
                                                                </span>
                                                            )}
                                                            <span className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-3">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                        </div>
                                        <p className="text-sm text-gray-400">No transactions yet</p>
                                        <button onClick={() => setShowAddTransaction(true)} className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                            Add your first transaction
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <h2 className="text-sm font-semibold text-gray-900 mb-4">Monthly Trend</h2>
                                {stats?.monthly_trend?.length ? (
                                    <div className="space-y-3">
                                        {stats.monthly_trend.slice(-6).map((m) => {
                                            const total = m.income + m.expense || 1;
                                            const incomePct = (m.income / total) * 100;
                                            const expensePct = (m.expense / total) * 100;
                                            const net = m.income - m.expense;
                                            return (
                                                <div key={m.month} className="p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-medium text-gray-500">{m.month}</span>
                                                        <span className={`text-xs font-semibold ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            Net: {formatCurrency(net)}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-1 h-2">
                                                        <div className="bg-emerald-500 rounded-l-full" style={{ width: `${incomePct}%` }} />
                                                        <div className="bg-rose-500 rounded-r-full" style={{ width: `${expensePct}%` }} />
                                                    </div>
                                                    <div className="flex justify-between mt-1.5">
                                                        <span className="text-xs text-emerald-600">+{formatCurrency(m.income)}</span>
                                                        <span className="text-xs text-rose-600">-{formatCurrency(m.expense)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-3">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                        </div>
                                        <p className="text-sm text-gray-400">No trend data yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Modal show={showAddTransaction} onClose={() => setShowAddTransaction(false)} title="Add Transaction">
                <TransactionForm categories={categories} onSubmit={handleAddTransaction} onCancel={() => setShowAddTransaction(false)} isSubmitting={submitting} />
            </Modal>
        </AuthenticatedLayout>
    );
}
