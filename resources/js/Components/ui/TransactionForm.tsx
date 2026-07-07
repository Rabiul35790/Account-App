import { useState } from 'react';
import { Category } from '@/types';

interface TransactionFormProps {
    categories: Category[];
    initialData?: { type?: string; category_id?: number | null; amount?: number; description?: string; date?: string; notes?: string };
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export default function TransactionForm({ categories, initialData, onSubmit, onCancel, isSubmitting }: TransactionFormProps) {
    const [type, setType] = useState(initialData?.type || 'expense');
    const [categoryId, setCategoryId] = useState(initialData?.category_id?.toString() || '');
    const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState(initialData?.notes || '');

    const filteredCategories = categories.filter(c => c.type === type && c.is_active);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            type,
            category_id: categoryId ? parseInt(categoryId) : null,
            amount: parseFloat(amount),
            description,
            date,
            notes: notes || null,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
                {(['expense', 'income'] as const).map(t => (
                    <button key={t} type="button" onClick={() => { setType(t); setCategoryId(''); }}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                            type === t
                                ? t === 'expense' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                        {t === 'expense' ? 'Expense' : 'Income'}
                    </button>
                ))}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option value="">Select category</option>
                    {filteredCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} required
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>

            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onCancel}
                    className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                    className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    {isSubmitting ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
}
