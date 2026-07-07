import { useState } from 'react';

interface CategoryFormProps {
    initialData?: { name?: string; type?: string; description?: string; color?: string };
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

export default function CategoryForm({ initialData, onSubmit, onCancel, isSubmitting }: CategoryFormProps) {
    const [name, setName] = useState(initialData?.name || '');
    const [type, setType] = useState(initialData?.type || 'expense');
    const [description, setDescription] = useState(initialData?.description || '');
    const [color, setColor] = useState(initialData?.color || '#6366f1');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, type, description: description || null, color });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
                {(['expense', 'income'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setType(t)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                            type === t
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                        {t === 'expense' ? 'Expense' : 'Income'}
                    </button>
                ))}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                    {COLORS.map(c => (
                        <button key={c} type="button" onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                            style={{ backgroundColor: c }} />
                    ))}
                </div>
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
