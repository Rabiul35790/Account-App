import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import LoadingSpinner from '@/Components/ui/LoadingSpinner';
import ConfirmModal from '@/Components/ui/ConfirmModal';

interface DeletedItem {
    id: number;
    description?: string;
    name?: string;
    deleted_at: string;
    deleted_by?: { id: number; name: string } | null;
    category?: { name: string } | null;
    type?: string;
    amount?: number;
}

export default function TrashIndex() {
    const [data, setData] = useState<{ transactions: DeletedItem[]; categories: DeletedItem[]; budgets: DeletedItem[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [restoring, setRestoring] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: number; label: string } | null>(null);

    const fetchTrash = async () => {
        try {
            const res = await fetch('/api/trash');
            setData(await res.json());
        } catch (e) {
            console.error('Failed to fetch trash', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTrash(); }, []);

    const handleRestore = async (type: string, id: number) => {
        setRestoring(id);
        try {
            await fetch(`/api/trash/restore/${type}/${id}`, { method: 'POST', headers: { 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content } });
            fetchTrash();
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Item restored successfully.', type: 'success' } }));
        } catch (e) {
            console.error('Failed to restore', e);
        } finally {
            setRestoring(null);
        }
    };

    const handleForceDelete = async (type: string, id: number) => {
        setDeleting(id);
        try {
            await fetch(`/api/trash/${type}/${id}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content } });
            fetchTrash();
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Item permanently deleted.', type: 'success' } }));
        } catch (e) {
            console.error('Failed to delete', e);
        } finally {
            setDeleting(null);
        }
    };

    if (loading) return <AuthenticatedLayout><LoadingSpinner /></AuthenticatedLayout>;

    const totalDeleted = (data?.transactions?.length || 0) + (data?.categories?.length || 0) + (data?.budgets?.length || 0);

    const Section = ({ title, items, type }: { title: string; items: DeletedItem[]; type: string }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                <span className="text-xs text-gray-400">{items.length} items</span>
            </div>
            {items.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">No deleted {title.toLowerCase()}.</div>
            ) : (
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-50">
                            <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted By</th>
                            <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted At</th>
                            <th className="text-right py-2.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                <td className="py-2.5 px-4 text-sm text-gray-900">{item.name || item.description || `Transaction #${item.id}`}</td>
                                <td className="py-2.5 px-4 text-sm text-gray-500">{item.deleted_by?.name || '—'}</td>
                                <td className="py-2.5 px-4 text-sm text-gray-500">{new Date(item.deleted_at).toLocaleString()}</td>
                                <td className="py-2.5 px-4 text-right flex items-center justify-end gap-1">
                                    <button onClick={() => handleRestore(type, item.id)} disabled={restoring === item.id}
                                        className="px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50">
                                        {restoring === item.id ? 'Restoring...' : 'Restore'}
                                    </button>
                                    <button onClick={() => setConfirmDelete({ type, id: item.id, label: item.name || item.description || `Transaction #${item.id}` })} disabled={deleting === item.id}
                                        className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                                        {deleting === item.id ? 'Deleting...' : 'Delete permanently'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Trash" />
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Trash</h1>
                    <p className="text-sm text-gray-400 mt-1">{totalDeleted} deleted items</p>
                </div>
                {data && (
                    <>
                        <Section title="Transactions" items={data.transactions} type="transaction" />
                        <Section title="Categories" items={data.categories} type="category" />
                        <Section title="Budgets" items={data.budgets} type="budget" />
                    </>
                )}
            </div>

            <ConfirmModal
                show={!!confirmDelete}
                title="Delete permanently?"
                message={`Are you sure you want to permanently delete "${confirmDelete?.label}"? This action cannot be undone.`}
                confirmLabel="Delete permanently"
                onConfirm={() => { if (confirmDelete) handleForceDelete(confirmDelete.type, confirmDelete.id); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />
        </AuthenticatedLayout>
    );
}
