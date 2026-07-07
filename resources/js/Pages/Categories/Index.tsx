import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Category } from '@/types';
import Modal from '@/Components/ui/Modal';
import CategoryForm from '@/Components/ui/CategoryForm';
import LoadingSpinner from '@/Components/ui/LoadingSpinner';
import EmptyState from '@/Components/ui/EmptyState';
import ActivityLogModal from '@/Components/ui/ActivityLogModal';
import ConfirmModal from '@/Components/ui/ConfirmModal';

const tagIcon = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
const editIcon = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const deleteIcon = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const logIcon = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default function CategoryList() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [logModal, setLogModal] = useState<{ id: number; title: string } | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [confirmDelete, setConfirmDelete] = useState<{ id?: number; ids?: number[]; type: 'single' | 'bulk' } | null>(null);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data);
        } catch (e) {
            console.error('Failed to fetch categories', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleSubmit = async (data: any) => {
        setSubmitting(true);
        try {
            const url = editing ? `/api/categories/${editing.id}` : '/api/categories';
            const method = editing ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                setShowModal(false);
                setEditing(null);
                fetchCategories();
                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: editing ? 'Category updated.' : 'Category created.', type: 'success' } }));
            }
        } catch (e) {
            console.error('Failed to save category', e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id: number) => setConfirmDelete({ id, type: 'single' });
    const confirmSingleDelete = async () => {
        if (!confirmDelete || confirmDelete.type !== 'single') return;
        try {
            await fetch(`/api/categories/${confirmDelete.id}`, { method: 'DELETE' });
            fetchCategories();
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Category deleted.', type: 'success' } }));
        } catch (e) { console.error(e); }
        setConfirmDelete(null);
    };
    const handleBulkDelete = () => setConfirmDelete({ ids: selectedIds, type: 'bulk' });
    const confirmBulkDelete = async () => {
        if (!confirmDelete || confirmDelete.type !== 'bulk' || !confirmDelete.ids) return;
        try {
            await fetch('/api/categories/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ ids: confirmDelete.ids }),
            });
            setSelectedIds([]);
            fetchCategories();
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `${confirmDelete.ids.length} categories deleted.`, type: 'success' } }));
        } catch (e) { console.error(e); }
        setConfirmDelete(null);
    };

    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');

    return (
        <AuthenticatedLayout>
            <Head title="Categories" />
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                        <p className="text-sm text-gray-400 mt-1">Organize your transactions with categories</p>
                    </div>
                    <button onClick={() => { setEditing(null); setShowModal(true); }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Category
                    </button>
                </div>

                {loading ? <LoadingSpinner /> : categories.length === 0 ? (
                    <EmptyState icon={tagIcon} title="No categories" description="Create categories to organize your transactions" />
                ) : (
                    <>
                    {selectedIds.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 mb-4 flex items-center gap-3">
                            <span className="text-sm text-gray-600">{selectedIds.length} selected</span>
                            <button onClick={handleBulkDelete} className="px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">Delete Selected</button>
                            <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">Clear</button>
                        </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Income Categories</h2>
                                <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                                    <input type="checkbox" checked={selectedIds.length === incomeCategories.length && incomeCategories.length > 0} onChange={e => { if (e.target.checked) setSelectedIds([...new Set([...selectedIds, ...incomeCategories.map(c => c.id)])]); else setSelectedIds(selectedIds.filter(id => !incomeCategories.some(c => c.id === id))); }} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                    Select All
                                </label>
                            </div>
                            <div className="space-y-2">
                                {incomeCategories.map(c => (
                                    <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={e => { if (e.target.checked) setSelectedIds([...selectedIds, c.id]); else setSelectedIds(selectedIds.filter(id => id !== c.id)); }} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                                            <span className="text-sm font-medium text-gray-900">{c.name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => setLogModal({ id: c.id, title: c.name })} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-white transition-colors">{logIcon}</button>
                                            <button onClick={() => { setEditing(c); setShowModal(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-white transition-colors">{editIcon}</button>
                                            <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-white transition-colors">{deleteIcon}</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Expense Categories</h2>
                                <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                                    <input type="checkbox" checked={selectedIds.length === expenseCategories.length && expenseCategories.length > 0} onChange={e => { if (e.target.checked) setSelectedIds([...new Set([...selectedIds, ...expenseCategories.map(c => c.id)])]); else setSelectedIds(selectedIds.filter(id => !expenseCategories.some(c => c.id === id))); }} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                    Select All
                                </label>
                            </div>
                            <div className="space-y-2">
                                {expenseCategories.map(c => (
                                    <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={e => { if (e.target.checked) setSelectedIds([...selectedIds, c.id]); else setSelectedIds(selectedIds.filter(id => id !== c.id)); }} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                                            <span className="text-sm font-medium text-gray-900">{c.name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => setLogModal({ id: c.id, title: c.name })} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-white transition-colors">{logIcon}</button>
                                            <button onClick={() => { setEditing(c); setShowModal(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-white transition-colors">{editIcon}</button>
                                            <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-white transition-colors">{deleteIcon}</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    </>
                )}
            </div>

            <Modal show={showModal} onClose={() => { setShowModal(false); setEditing(null); }} title={editing ? 'Edit Category' : 'Add Category'}>
                <CategoryForm initialData={editing ? { name: editing.name, type: editing.type, description: editing.description || '', color: editing.color } : undefined}
                    onSubmit={handleSubmit} onCancel={() => { setShowModal(false); setEditing(null); }} isSubmitting={submitting} />
            </Modal>
            <ActivityLogModal show={logModal !== null} onClose={() => setLogModal(null)} subjectType="App\Models\Category" subjectId={logModal?.id || 0} title={logModal?.title || ''} />
            <ConfirmModal show={confirmDelete !== null} title="Delete Category" message={confirmDelete?.type === 'bulk' ? `Delete ${confirmDelete?.ids?.length || 0} categories?` : 'Are you sure you want to delete this category?'} confirmLabel="Delete" onConfirm={confirmDelete?.type === 'bulk' ? confirmBulkDelete : confirmSingleDelete} onCancel={() => setConfirmDelete(null)} />
        </AuthenticatedLayout>
    );
}
