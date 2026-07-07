import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Category, Budget } from '@/types';
import Modal from '@/Components/ui/Modal';
import LoadingSpinner from '@/Components/ui/LoadingSpinner';
import EmptyState from '@/Components/ui/EmptyState';

const budgetIcon = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h3v6m-3 0h6" /></svg>;

export default function BudgetList() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Budget | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ category_id: '', amount: '', period: 'monthly', start_date: new Date().toISOString().split('T')[0], end_date: '' });

    const fetchData = async () => {
        try {
            const [budgetsRes, categoriesRes] = await Promise.all([
                fetch('/api/budgets/spending'),
                fetch('/api/categories'),
            ]);
            setBudgets(await budgetsRes.json());
            setCategories(await categoriesRes.json());
        } catch (e) {
            console.error('Failed to fetch', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ category_id: '', amount: '', period: 'monthly', start_date: new Date().toISOString().split('T')[0], end_date: '' });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editing ? `/api/budgets/${editing.id}` : '/api/budgets';
            const method = editing ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    amount: parseFloat(form.amount),
                    category_id: parseInt(form.category_id),
                    end_date: form.end_date || null,
                }),
            });
            if (res.ok) {
                setShowModal(false);
                fetchData();
            }
        } catch (e) {
            console.error('Failed to save budget', e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this budget?')) return;
        await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
        fetchData();
    };

    if (loading) return <AuthenticatedLayout><LoadingSpinner /></AuthenticatedLayout>;

    const expenseCategories = categories.filter(c => c.type === 'expense');

    return (
        <AuthenticatedLayout>
            <Head title="Budgets" />
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h1>
                        <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">+ Add Budget</button>
                    </div>

                    {budgets.length === 0 ? (
                        <EmptyState icon={budgetIcon} title="No budgets" description="Set budgets to track your spending limits" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {budgets.map(b => (
                                <div key={b.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{b.category?.name || 'Uncategorized'}</h3>
                                            <p className="text-sm text-gray-500 capitalize">{b.period} budget</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditing(b); setForm({ category_id: b.category_id.toString(), amount: b.amount.toString(), period: b.period, start_date: b.start_date, end_date: b.end_date || '' }); setShowModal(true); }}
                                                className="text-gray-400 hover:text-indigo-600 text-sm">Edit</button>
                                            <button onClick={() => handleDelete(b.id)} className="text-gray-400 hover:text-rose-600 text-sm">Delete</button>
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-500">${Number(b.spent || 0).toLocaleString()} spent</span>
                                            <span className="text-gray-500">of ${Number(b.amount).toLocaleString()}</span>
                                        </div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all ${(b.percentage || 0) > 90 ? 'bg-rose-500' : (b.percentage || 0) > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min(100, b.percentage || 0)}%` }} />
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className={((b.remaining || 0) >= 0) ? 'text-emerald-600' : 'text-rose-600'}>
                                            {(b.remaining || 0) >= 0 ? `${Number(b.remaining).toLocaleString()} remaining` : `${Math.abs(Number(b.remaining)).toLocaleString()} over budget`}
                                        </span>
                                        <span className="text-gray-500">{b.percentage}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Budget' : 'Add Budget'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                            <option value="">Select category</option>
                            {expenseCategories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                        <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period</label>
                        <select value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                            <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                            <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowModal(false)}
                            className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
                        <button type="submit" disabled={submitting}
                            className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {submitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
