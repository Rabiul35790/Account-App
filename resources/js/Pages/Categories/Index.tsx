import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Category } from '@/types';
import Modal from '@/Components/ui/Modal';
import CategoryForm from '@/Components/ui/CategoryForm';
import LoadingSpinner from '@/Components/ui/LoadingSpinner';
import EmptyState from '@/Components/ui/EmptyState';

const tagIcon = <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
const editIcon = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const deleteIcon = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default function CategoryList() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [submitting, setSubmitting] = useState(false);

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
            }
        } catch (e) {
            console.error('Failed to save category', e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            fetchCategories();
        } catch (e) {
            console.error('Failed to delete', e);
        }
    };

    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');

    return (
        <AuthenticatedLayout>
            <Head title="Categories" />
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
                        <button onClick={() => { setEditing(null); setShowModal(true); }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            + Add Category
                        </button>
                    </div>

                    {loading ? <LoadingSpinner /> : categories.length === 0 ? (
                        <EmptyState icon={tagIcon} title="No categories" description="Create categories to organize your transactions" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-lg font-semibold text-emerald-600 mb-4">Income Categories</h2>
                                <div className="space-y-2">
                                    {incomeCategories.map(c => (
                                        <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEditing(c); setShowModal(true); }} className="text-gray-400 hover:text-indigo-600">{editIcon}</button>
                                                <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-rose-600">{deleteIcon}</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-lg font-semibold text-rose-600 mb-4">Expense Categories</h2>
                                <div className="space-y-2">
                                    {expenseCategories.map(c => (
                                        <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEditing(c); setShowModal(true); }} className="text-gray-400 hover:text-indigo-600">{editIcon}</button>
                                                <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-rose-600">{deleteIcon}</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={showModal} onClose={() => { setShowModal(false); setEditing(null); }} title={editing ? 'Edit Category' : 'Add Category'}>
                <CategoryForm initialData={editing ? { name: editing.name, type: editing.type, description: editing.description || '', color: editing.color } : undefined}
                    onSubmit={handleSubmit} onCancel={() => { setShowModal(false); setEditing(null); }} isSubmitting={submitting} />
            </Modal>
        </AuthenticatedLayout>
    );
}
