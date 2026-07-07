import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Transaction, Category, PaginatedResponse } from '@/types';
import Modal from '@/Components/ui/Modal';
import TransactionForm from '@/Components/ui/TransactionForm';
import LoadingSpinner from '@/Components/ui/LoadingSpinner';
import EmptyState from '@/Components/ui/EmptyState';
import ActivityLogModal from '@/Components/ui/ActivityLogModal';
import ConfirmModal from '@/Components/ui/ConfirmModal';

const editIcon = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const deleteIcon = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const logIcon = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const listIcon = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;

export default function TransactionList() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Transaction | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [logModal, setLogModal] = useState<{ id: number; title: string } | null>(null);
    const [filter, setFilter] = useState({ type: '', search: '', page: 1 });
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [confirmDelete, setConfirmDelete] = useState<{ id?: number; ids?: number[]; type: 'single' | 'bulk' } | null>(null);

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
                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: editing ? 'Transaction updated.' : 'Transaction created.', type: 'success' } }));
            }
        } catch (e) {
            console.error('Failed to save transaction', e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id: number) => setConfirmDelete({ id, type: 'single' });
    const confirmSingleDelete = async () => {
        if (!confirmDelete || confirmDelete.type !== 'single') return;
        try {
            await fetch(`/api/transactions/${confirmDelete.id}`, { method: 'DELETE' });
            fetchTransactions();
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Transaction deleted.', type: 'success' } }));
        } catch (e) { console.error(e); }
        setConfirmDelete(null);
    };
    const handleBulkDelete = () => setConfirmDelete({ ids: selectedIds, type: 'bulk' });
    const confirmBulkDelete = async () => {
        if (!confirmDelete || confirmDelete.type !== 'bulk' || !confirmDelete.ids) return;
        try {
            await fetch('/api/transactions/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ ids: confirmDelete.ids }),
            });
            setSelectedIds([]);
            fetchTransactions();
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `${confirmDelete.ids.length} transactions deleted.`, type: 'success' } }));
        } catch (e) { console.error(e); }
        setConfirmDelete(null);
    };

    const openEdit = (tx: Transaction) => {
        setEditing(tx);
        setShowModal(true);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Transactions" />
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                        <p className="text-sm text-gray-400 mt-1">Manage your income and expenses</p>
                    </div>
                    <button onClick={() => { setEditing(null); setShowModal(true); }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Transaction
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-wrap gap-3 items-center">
                        <select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value, page: 1 })}
                            className="px-3 py-2 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none bg-[length:16px] bg-[center_right_8px] bg-no-repeat" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%239CA3AF' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")" }}>
                            <option value="">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                        <input type="text" placeholder="Search..." value={filter.search}
                            onChange={e => setFilter({ ...filter, search: e.target.value, page: 1 })}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 flex-1 min-w-[200px]" />
                        <span className="text-sm text-gray-400">{pagination.total} transactions</span>
                    </div>
                </div>

                {selectedIds.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 mb-4 flex items-center gap-3">
                        <span className="text-sm text-gray-600">{selectedIds.length} selected</span>
                        <button onClick={handleBulkDelete} className="px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">Delete Selected</button>
                        <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">Clear</button>
                    </div>
                )}

                {loading ? <LoadingSpinner /> : transactions.length === 0 ? (
                    <EmptyState icon={listIcon} title="No transactions" description="Add your first transaction to get started" />
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="py-3.5 px-2"><input type="checkbox" onChange={e => { if (e.target.checked) setSelectedIds(transactions.map(t => t.id)); else setSelectedIds([]); }} checked={selectedIds.length === transactions.length && transactions.length > 0} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /></th>
                                    <th className="text-left py-3.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="text-left py-3.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="text-left py-3.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="text-right py-3.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="text-right py-3.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(tx => (
                                    <tr key={tx.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-2"><input type="checkbox" checked={selectedIds.includes(tx.id)} onChange={e => { if (e.target.checked) setSelectedIds([...selectedIds, tx.id]); else setSelectedIds(selectedIds.filter(id => id !== tx.id)); }} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /></td>
                                        <td className="py-3 px-4 text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{tx.description}</td>
                                        <td className="py-3 px-4 text-sm text-gray-500">
                                            {tx.category && <span className="inline-flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.category.color }} />
                                                {tx.category.name}
                                            </span>}
                                        </td>
                                        <td className={`py-3 px-4 text-sm font-semibold text-right ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {tx.type === 'income' ? '+' : '-'}৳{Number(tx.amount).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button onClick={() => setLogModal({ id: tx.id, title: tx.description })} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-gray-100 transition-colors mr-1">{logIcon}</button>
                                            <button onClick={() => openEdit(tx)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-gray-100 transition-colors mr-1">{editIcon}</button>
                                            <button onClick={() => handleDelete(tx.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-gray-100 transition-colors">{deleteIcon}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {pagination.last_page > 1 && (
                            <div className="flex justify-center gap-1.5 p-4 border-t border-gray-100">
                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(p => (
                                    <button key={p} onClick={() => setFilter({ ...filter, page: p })}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${p === pagination.current_page ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal show={showModal} onClose={() => { setShowModal(false); setEditing(null); }} title={editing ? 'Edit Transaction' : 'Add Transaction'}>
                <TransactionForm categories={categories}
                    initialData={editing ? { type: editing.type, category_id: editing.category_id, amount: editing.amount, description: editing.description, date: editing.date, notes: editing.notes || '' } : undefined}
                    onSubmit={handleSubmit} onCancel={() => { setShowModal(false); setEditing(null); }} isSubmitting={submitting} />
            </Modal>
            <ActivityLogModal show={logModal !== null} onClose={() => setLogModal(null)} subjectType="App\Models\Transaction" subjectId={logModal?.id || 0} title={logModal?.title || ''} />
            <ConfirmModal show={confirmDelete !== null} title="Delete Transaction" message={confirmDelete?.type === 'bulk' ? `Delete ${selectedIds.length} transactions?` : 'Are you sure you want to delete this transaction?'} confirmLabel="Delete" onConfirm={confirmDelete?.type === 'bulk' ? confirmBulkDelete : confirmSingleDelete} onCancel={() => setConfirmDelete(null)} />
        </AuthenticatedLayout>
    );
}
