import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { ReportSummary } from '@/types';
import LoadingSpinner from '@/Components/ui/LoadingSpinner';

const reportIcon = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;

export default function ReportPage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [report, setReport] = useState<ReportSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/reports/summary?year=${year}`)
            .then(res => res.json())
            .then(data => setReport(data))
            .finally(() => setLoading(false));
    }, [year]);

    if (loading) return <AuthenticatedLayout><LoadingSpinner /></AuthenticatedLayout>;

    return (
        <AuthenticatedLayout>
            <Head title="Reports" />
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Annual Report</h1>
                        <select value={year} onChange={e => setYear(parseInt(e.target.value))}
                            className="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    {report && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <p className="text-sm text-gray-500">Total Income</p>
                                    <p className="text-2xl font-bold text-emerald-600">${Number(report.total_income).toLocaleString()}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <p className="text-sm text-gray-500">Total Expenses</p>
                                    <p className="text-2xl font-bold text-rose-600">${Number(report.total_expense).toLocaleString()}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <p className="text-sm text-gray-500">Net</p>
                                    <p className={`text-2xl font-bold ${report.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        ${Number(report.net).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Breakdown</h2>
                                    {report.monthly.map(m => (
                                        <div key={m.month} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{m.month}</span>
                                            <div className="flex gap-4">
                                                <span className="text-sm text-emerald-600">+${Number(m.income).toLocaleString()}</span>
                                                <span className="text-sm text-rose-600">-${Number(m.expense).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown</h2>
                                    {report.category_breakdown.map(c => (
                                        <div key={c.category_id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{c.category?.name || 'Uncategorized'}</span>
                                            <span className="text-sm font-medium">${Number(c.total).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
