import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Transaction, Category, PaginatedResponse } from '@/types';
import Modal from '@/Components/ui/Modal';
import TransactionForm from '@/Components/ui/TransactionForm';
import LoadingSpinner from '@/Components/ui/LoadingSpinner';
import EmptyState from '@/Components/ui/EmptyState';

const editIcon = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const deleteIcon = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const listIcon = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;

export default function TransactionList() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Transaction | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState({ type: '', search: '', page: 1 });
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

    const fetchTransactions = async () => {
        try {
            const params = new URLSearchParams();
            if (filter.type) params.set('type', filter.type);
            if (filter.search) params.set('search', filter.search);
            params.set('page', filter.page.toString());
            const res = await fetch(`/api/transactions?${params}`);
            const data: PaginatedResponse<Transaction> = await res.json();
            setTransactions(data.data);
            setPagination({ current_page: data.current_page, last_page: data.last_page, total: data.total });
        } catch (e) {
            console.error('Failed to fetch transactions', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data);
        } catch (e) {}
    };

    useEffect(() => { fetchTransactions(); fetchCategories(); }, [filter]);

    const handleSubmit = async (data: any) => {
        setSubmitting(true);
        try {
            const url = editing ? `/api/transactions/${editing.id}` : '/api/transactions';
            const method = editing ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                setShowModal(false);
                setEditing(null);
                fetchTransactions();
            }
        } catch (e) {
            console.error('Failed to save transaction', e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;
        try {
            await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
            fetchTransactions();
        } catch (e) {
            console.error('Failed to delete', e);
        }
    };

    const openEdit = (tx: Transaction) => {
        setEditing(tx);
        setShowModal(true);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Transactions" />
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
                        <button onClick={() => { setEditing(null); setShowModal(true); }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            + Add Transaction
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                        <div className="flex flex-wrap gap-3">
                            <select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value, page: 1 })}
                                className="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                <option value="">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                            <input type="text" placeholder="Search..." value={filter.search}
                                onChange={e => setFilter({ ...filter, search: e.target.value, page: 1 })}
                                className="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white flex-1 min-w-[200px]" />
                            <span className="text-sm text-gray-500 self-center">{pagination.total} transactions</span>
                        </div>
                    </div>

                    {loading ? <LoadingSpinner /> : transactions.length === 0 ? (
                        <EmptyState icon={listIcon} title="No transactions" description="Add your first transaction to get started" />
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Description</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Category</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(tx => (
                                        <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{new Date(tx.date).toLocaleDateString()}</td>
                                            <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{tx.description}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                {tx.category && <span className="inline-flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.category.color }} />
                                                    {tx.category.name}
                                                </span>}
                                            </td>
                                            <td className={`py-3 px-4 text-sm font-semibold text-right ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button onClick={() => openEdit(tx)} className="text-gray-400 hover:text-indigo-600 mr-2">{editIcon}</button>
                                                <button onClick={() => handleDelete(tx.id)} className="text-gray-400 hover:text-rose-600">{deleteIcon}</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {pagination.last_page > 1 && (
                                <div className="flex justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(p => (
                                        <button key={p} onClick={() => setFilter({ ...filter, page: p })}
                                            className={`px-3 py-1 rounded text-sm ${p === pagination.current_page ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Modal show={showModal} onClose={() => { setShowModal(false); setEditing(null); }} title={editing ? 'Edit Transaction' : 'Add Transaction'}>
                <TransactionForm categories={categories}
                    initialData={editing ? { type: editing.type, category_id: editing.category_id, amount: editing.amount, description: editing.description, date: editing.date, notes: editing.notes || '' } : undefined}
                    onSubmit={handleSubmit} onCancel={() => { setShowModal(false); setEditing(null); }} isSubmitting={submitting} />
            </Modal>
        </AuthenticatedLayout>
    );
}
