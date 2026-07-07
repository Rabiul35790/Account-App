import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { DashboardStats, Category } from '@/types';
import StatCard from '@/Components/ui/StatCard';
import LoadingSpinner from '@/Components/ui/LoadingSpinner';
import Modal from '@/Components/ui/Modal';
import TransactionForm from '@/Components/ui/TransactionForm';
import EmptyState from '@/Components/ui/EmptyState';

const incomeIcon = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const expenseIcon = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const balanceIcon = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const addIcon = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;

export default function Dashboard() {
    const { auth } = usePage().props as any;
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

    if (loading) return <AuthenticatedLayout><LoadingSpinner /></AuthenticatedLayout>;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                        <button onClick={() => setShowAddTransaction(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            {addIcon} Add Transaction
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard title="Monthly Income" value={stats?.monthly_income || 0} icon={incomeIcon} color="emerald" />
                        <StatCard title="Monthly Expenses" value={stats?.monthly_expense || 0} icon={expenseIcon} color="rose" />
                        <StatCard title="Balance" value={stats?.balance || 0} icon={balanceIcon} color={stats && stats.balance >= 0 ? 'indigo' : 'rose'} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h2>
                            {stats?.recent_transactions && stats.recent_transactions.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.recent_transactions.map(tx => (
                                        <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${tx.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.description}</p>
                                                    <p className="text-xs text-gray-500">{tx.category?.name || 'Uncategorized'} &middot; {new Date(tx.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : <EmptyState icon={balanceIcon} title="No transactions yet" description="Add your first transaction to see it here" />}
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Overview</h2>
                            {stats?.monthly_trend && stats.monthly_trend.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.monthly_trend.slice(-3).map(m => {
                                        const net = m.income - m.expense;
                                        return (
                                            <div key={m.month} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{m.month}</p>
                                                <div className="flex justify-between mt-1">
                                                    <span className="text-sm text-emerald-600">+${Number(m.income).toLocaleString()}</span>
                                                    <span className="text-sm text-rose-600">-${Number(m.expense).toLocaleString()}</span>
                                                    <span className={`text-sm font-semibold ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        Net: ${Number(net).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (m.income / (m.income + m.expense || 1)) * 100)}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : <EmptyState icon={balanceIcon} title="No data yet" description="Transactions will appear here" />}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showAddTransaction} onClose={() => setShowAddTransaction(false)} title="Add Transaction">
                <TransactionForm categories={categories} onSubmit={handleAddTransaction} onCancel={() => setShowAddTransaction(false)} isSubmitting={submitting} />
            </Modal>
        </AuthenticatedLayout>
    );
}
