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
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Annual Report</h1>
                        <p className="text-sm text-gray-400 mt-1">Financial summary for the year</p>
                    </div>
                    <select value={year} onChange={e => setYear(parseInt(e.target.value))}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                        {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                {report && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Income</p>
                                        <p className="text-xl font-bold text-emerald-600 mt-0.5">৳{Number(report.total_income).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Expenses</p>
                                        <p className="text-xl font-bold text-rose-600 mt-0.5">৳{Number(report.total_expense).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-lg ${report.net >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Net</p>
                                        <p className={`text-xl font-bold mt-0.5 ${report.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            ৳{Number(report.net).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <h2 className="text-sm font-semibold text-gray-900 mb-4">Monthly Breakdown</h2>
                                {report.monthly.map(m => (
                                    <div key={m.month} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                                        <span className="text-sm text-gray-500">{m.month}</span>
                                        <div className="flex gap-4 text-sm">
                                            <span className="text-emerald-600 font-medium">+৳{Number(m.income).toLocaleString()}</span>
                                            <span className="text-rose-600 font-medium">-৳{Number(m.expense).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <h2 className="text-sm font-semibold text-gray-900 mb-4">Category Breakdown</h2>
                                {report.category_breakdown.map(c => (
                                    <div key={c.category_id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                                        <span className="text-sm text-gray-500">{c.category?.name || 'Uncategorized'}</span>
                                        <span className="text-sm font-medium text-gray-900">৳{Number(c.total).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
