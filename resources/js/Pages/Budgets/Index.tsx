import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Category, Budget } from '@/types';
import Modal from '@/Components/ui/Modal';
import LoadingSpinner from '@/Components/ui/LoadingSpinner';
import EmptyState from '@/Components/ui/EmptyState';
import ActivityLogModal from '@/Components/ui/ActivityLogModal';
import ConfirmModal from '@/Components/ui/ConfirmModal';

const budgetIcon = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h3v6m-3 0h6" /></svg>;
const logIcon = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default function BudgetList() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Budget | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [logModal, setLogModal] = useState<{ id: number; title: string } | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [confirmDelete, setConfirmDelete] = useState<{ id?: number; ids?: number[]; type: 'single' | 'bulk' } | null>(null);
    const [form, setForm] = useState({ category_id: '', amount: '', period: 'monthly', start_date: new Date().toISOString().split('T')[0], end_date: '' });

    const fetchData = async () => {
        try {
            const [budgetsRes, categoriesRes] = await Promise.all([
                fetch('/api/budgets/spending'),
                fetch('/api/categories'),
            ]);
            const data = await budgetsRes.json();
            setBudgets(Array.isArray(data) ? data : []);
            setCategories(await categoriesRes.json());
        } catch (e) {
            console.error('Failed to fetch', e);
            setBudgets([]);
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
                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: editing ? 'Budget updated.' : 'Budget created.', type: 'success' } }));
            }
        } catch (e) {
            console.error('Failed to save budget', e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id: number) => setConfirmDelete({ id, type: 'single' });
    const confirmSingleDelete = async () => {
        if (!confirmDelete || confirmDelete.type !== 'single') return;
        try {
            await fetch(`/api/budgets/${confirmDelete.id}`, { method: 'DELETE' });
            fetchData();
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Budget deleted.', type: 'success' } }));
        } catch (e) { console.error(e); }
        setConfirmDelete(null);
    };
    const handleBulkDelete = () => setConfirmDelete({ ids: selectedIds, type: 'bulk' });
    const confirmBulkDelete = async () => {
        if (!confirmDelete || confirmDelete.type !== 'bulk' || !confirmDelete.ids) return;
        try {
            await fetch('/api/budgets/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ ids: confirmDelete.ids }),
            });
            setSelectedIds([]);
            fetchData();
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `${confirmDelete.ids.length} budgets deleted.`, type: 'success' } }));
        } catch (e) { console.error(e); }
        setConfirmDelete(null);
    };

    if (loading) return <AuthenticatedLayout><LoadingSpinner /></AuthenticatedLayout>;

    const expenseCategories = categories.filter(c => c.type === 'expense');

    const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors";
    const labelClass = "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider";

    return (
        <AuthenticatedLayout>
            <Head title="Budgets" />
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
                        <p className="text-sm text-gray-400 mt-1">Track your spending limits</p>
                    </div>
                    <button onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Budget
                    </button>
                </div>

                {budgets.length === 0 ? (
                    <EmptyState icon={budgetIcon} title="No budgets" description="Set budgets to track your spending limits" />
                ) : (
                    <>
                    {selectedIds.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 mb-4 flex items-center gap-3">
                            <span className="text-sm text-gray-600">{selectedIds.length} selected</span>
                            <button onClick={handleBulkDelete} className="px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">Delete Selected</button>
                            <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">Clear</button>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {budgets.map(b => (
                            <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={selectedIds.includes(b.id)} onChange={e => { if (e.target.checked) setSelectedIds([...selectedIds, b.id]); else setSelectedIds(selectedIds.filter(id => id !== b.id)); }} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{b.category?.name || 'Uncategorized'}</h3>
                                        <p className="text-sm text-gray-400 capitalize">{b.period} budget</p>
                                    </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => setLogModal({ id: b.id, title: b.category?.name || 'Budget' })} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-gray-50 transition-colors">{logIcon}</button>
                                        <button onClick={() => { setEditing(b); setForm({ category_id: b.category_id.toString(), amount: b.amount.toString(), period: b.period, start_date: b.start_date, end_date: b.end_date || '' }); setShowModal(true); }}
                                            className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(b.id)} className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-rose-600 hover:bg-gray-50 rounded-lg transition-colors">Delete</button>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-gray-400">৳{Number(b.spent || 0).toLocaleString()} spent</span>
                                        <span className="text-gray-400">of ৳{Number(b.amount).toLocaleString()}</span>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all ${(b.percentage || 0) > 90 ? 'bg-rose-500' : (b.percentage || 0) > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min(100, b.percentage || 0)}%` }} />
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className={(b.remaining || 0) >= 0 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
                                        {(b.remaining || 0) >= 0 ? `${Number(b.remaining).toLocaleString()} remaining` : `${Math.abs(Number(b.remaining)).toLocaleString()} over budget`}
                                    </span>
                                    <span className="text-gray-400">{b.percentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    </>
                )}
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Budget' : 'Add Budget'}>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className={labelClass}>Category</label>
                        <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required className={inputClass}>
                            <option value="">Select category</option>
                            {expenseCategories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">৳</span>
                            <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="0.00"
                                className={`${inputClass} pl-7`} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Period</label>
                        <select value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} className={inputClass}>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="half_yearly">Half-Yearly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Start Date</label>
                            <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>End Date</label>
                            <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className={inputClass} />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowModal(false)}
                            className="flex-1 py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting}
                            className="flex-1 py-2.5 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                            {submitting ? 'Saving...' : 'Save Budget'}
                        </button>
                    </div>
                </form>
            </Modal>
            <ActivityLogModal show={logModal !== null} onClose={() => setLogModal(null)} subjectType="App\Models\Budget" subjectId={logModal?.id || 0} title={logModal?.title || ''} />
            <ConfirmModal show={confirmDelete !== null} title="Delete Budget" message={confirmDelete?.type === 'bulk' ? `Delete ${confirmDelete?.ids?.length || 0} budgets?` : 'Are you sure you want to delete this budget?'} confirmLabel="Delete" onConfirm={confirmDelete?.type === 'bulk' ? confirmBulkDelete : confirmSingleDelete} onCancel={() => setConfirmDelete(null)} />
        </AuthenticatedLayout>
    );
}
