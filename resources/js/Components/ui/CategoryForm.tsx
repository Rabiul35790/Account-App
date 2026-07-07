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

    const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors";
    const labelClass = "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider";

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-2 p-1 bg-gray-50 rounded-lg">
                {(['expense', 'income'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setType(t)}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                            type === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}>
                        {t === 'expense' ? 'Expense' : 'Income'}
                    </button>
                ))}
            </div>

            <div>
                <label className={labelClass}>Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Category name" className={inputClass} />
            </div>

            <div>
                <label className={labelClass}>Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description" className={inputClass} />
            </div>

            <div>
                <label className={labelClass}>Color</label>
                <div className="flex gap-2 flex-wrap">
                    {COLORS.map(c => (
                        <button key={c} type="button" onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-110'}`}
                            style={{ backgroundColor: c }} />
                    ))}
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onCancel}
                    className="flex-1 py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                    {isSubmitting ? 'Saving...' : 'Save Category'}
                </button>
            </div>
        </form>
    );
}
