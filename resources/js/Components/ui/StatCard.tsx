import { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    color?: string;
    trend?: { value: number; isPositive: boolean };
}

export default function StatCard({ title, value, icon, color = 'indigo', trend }: StatCardProps) {
    const colorMap: Record<string, string> = {
        indigo: 'from-indigo-500 to-indigo-600',
        emerald: 'from-emerald-500 to-emerald-600',
        rose: 'from-rose-500 to-rose-600',
        amber: 'from-amber-500 to-amber-600',
        blue: 'from-blue-500 to-blue-600',
        violet: 'from-violet-500 to-violet-600',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {typeof value === 'number' ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value) : value}
                    </p>
                    {trend && (
                        <p className={`text-sm mt-1 ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {trend.isPositive ? '\u2191' : '\u2193'} {Math.abs(trend.value)}%
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${colorMap[color] || colorMap.indigo} text-white`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
