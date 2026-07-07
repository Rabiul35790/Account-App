import { useState, useEffect } from 'react';
import { Category } from '@/types';

interface TransactionFormProps {
    categories: Category[];
    initialData?: { type?: string; category_id?: number | null; amount?: number; description?: string; date?: string; notes?: string | null };
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

    const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors";
    const labelClass = "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider";

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-2 p-1 bg-gray-50 rounded-lg">
                {(['expense', 'income'] as const).map(t => (
                    <button key={t} type="button" onClick={() => { setType(t); setCategoryId(''); }}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                            type === t
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}>
                        {t === 'expense' ? 'Expense' : 'Income'}
                    </button>
                ))}
            </div>

            <div>
                <label className={labelClass}>Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputClass}>
                    <option value="">Select a category</option>
                    {filteredCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className={labelClass}>Amount</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">৳</span>
                    <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0.00"
                        className={`${inputClass} pl-7`} />
                </div>
            </div>

            <div>
                <label className={labelClass}>Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} required placeholder="Enter a description"
                    className={inputClass} />
            </div>

            <div>
                <label className={labelClass}>Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className={inputClass} />
            </div>

            <div>
                <label className={labelClass}>Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Add any notes..."
                    className={`${inputClass} resize-none`} />
            </div>

            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onCancel}
                    className="flex-1 py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                    {isSubmitting ? 'Saving...' : 'Save Transaction'}
                </button>
            </div>
        </form>
    );
}
