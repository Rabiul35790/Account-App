import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Modal from '@/Components/ui/Modal';
import ConfirmModal from '@/Components/ui/ConfirmModal';

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface UsersIndexProps {
    users: User[];
    errors?: Record<string, string>;
}

export default function UsersIndex({ users }: UsersIndexProps) {
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [confirmDelete, setConfirmDelete] = useState<{ id?: number; ids?: number[]; type: 'single' | 'bulk' } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content },
                body: JSON.stringify({ name, email, password }),
            });
            if (res.ok) {
                setShowModal(false);
                setName('');
                setEmail('');
                setPassword('');
                router.reload();
                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'User created successfully.', type: 'success' } }));
            } else {
                const data = await res.json();
                alert(Object.values(data.errors || {}).flat().join('\n'));
            }
        } catch (e) {
            console.error('Failed to create user', e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id: number) => setConfirmDelete({ id, type: 'single' });
    const confirmSingleDelete = async () => {
        if (!confirmDelete || confirmDelete.type !== 'single') return;
        try {
            await fetch(`/users/${confirmDelete.id}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content } });
            router.reload();
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'User deleted.', type: 'success' } }));
        } catch (e) { console.error(e); }
        setConfirmDelete(null);
    };
    const handleBulkDelete = () => setConfirmDelete({ ids: selectedIds, type: 'bulk' });
    const confirmBulkDelete = async () => {
        if (!confirmDelete || confirmDelete.type !== 'bulk' || !confirmDelete.ids) return;
        try {
            await fetch('/users/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content },
                body: JSON.stringify({ ids: confirmDelete.ids }),
            });
            setSelectedIds([]);
            router.reload();
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `${confirmDelete.ids.length} users deleted.`, type: 'success' } }));
        } catch (e) { console.error(e); }
        setConfirmDelete(null);
    };

    const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors";
    const labelClass = "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider";

    return (
        <AuthenticatedLayout>
            <Head title="Users" />
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                        <p className="text-sm text-gray-400 mt-1">Manage system users</p>
                    </div>
                    <button onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        Add User
                    </button>
                </div>

                {selectedIds.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 mb-4 flex items-center gap-3">
                        <span className="text-sm text-gray-600">{selectedIds.length} selected</span>
                        <button onClick={handleBulkDelete} className="px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">Delete Selected</button>
                        <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">Clear</button>
                    </div>
                )}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-3.5 px-2"><input type="checkbox" onChange={e => { if (e.target.checked) setSelectedIds(users.map(u => u.id)); else setSelectedIds([]); }} checked={selectedIds.length === users.length && users.length > 0} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /></th>
                                <th className="text-left py-3.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="text-left py-3.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="text-left py-3.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="text-right py-3.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-2"><input type="checkbox" checked={selectedIds.includes(u.id)} onChange={e => { if (e.target.checked) setSelectedIds([...selectedIds, u.id]); else setSelectedIds(selectedIds.filter(id => id !== u.id)); }} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /></td>
                                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{u.name}</td>
                                    <td className="py-3 px-4 text-sm text-gray-500">{u.email}</td>
                                    <td className="py-3 px-4 text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 text-right">
                                        <button onClick={() => handleDelete(u.id)}
                                            className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-rose-600 hover:bg-gray-50 rounded-lg transition-colors">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)} title="Add User">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className={labelClass}>Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className={inputClass} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowModal(false)}
                            className="flex-1 py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting}
                            className="flex-1 py-2.5 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                            {submitting ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </Modal>
            <ConfirmModal show={confirmDelete !== null} title="Delete User" message={confirmDelete?.type === 'bulk' ? `Delete ${confirmDelete?.ids?.length || 0} users?` : 'Are you sure you want to delete this user?'} confirmLabel="Delete" onConfirm={confirmDelete?.type === 'bulk' ? confirmBulkDelete : confirmSingleDelete} onCancel={() => setConfirmDelete(null)} />
        </AuthenticatedLayout>
    );
}
