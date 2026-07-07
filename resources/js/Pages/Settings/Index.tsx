import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

interface SettingsData {
    company_name: string | null;
    phone: string | null;
    primary_color: string;
    logo_url: string | null;
}

export default function SettingsIndex({ settings }: { settings: SettingsData }) {
    const [companyName, setCompanyName] = useState(settings.company_name || '');
    const [phone, setPhone] = useState(settings.phone || '');
    const [primaryColor, setPrimaryColor] = useState(settings.primary_color || '#6366f1');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo_url);
    const [saving, setSaving] = useState(false);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const formData = new FormData();
        formData.append('company_name', companyName);
        formData.append('phone', phone);
        formData.append('primary_color', primaryColor);
        if (logoFile) formData.append('logo', logoFile);

        try {
            const res = await fetch('/settings', {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content },
                body: formData,
            });
            if (res.ok) {
                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Settings updated successfully.', type: 'success' } }));
                router.reload();
            }
        } catch (e) {
            console.error('Failed to save settings', e);
        } finally {
            setSaving(false);
        }
    };

    const labelClass = "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider";
    const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors";

    return (
        <AuthenticatedLayout>
            <Head title="Settings" />
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage application branding (shared across all users)</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="mb-5">
                        <label className={labelClass}>Logo</label>
                        <div className="flex items-center gap-4 mt-1.5">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="h-16 w-auto rounded-lg border border-gray-200" />
                            ) : (
                                <div className="h-16 w-16 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-300">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                            )}
                            <label className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
                                Upload Logo
                                <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className={labelClass}>Company Name</label>
                            <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Phone</label>
                            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Primary Color</label>
                        <div className="flex items-center gap-3 mt-1.5">
                            <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                            <span className="text-sm text-gray-500">{primaryColor}</span>
                        </div>
                    </div>

                    <div className="flex justify-end mt-5">
                        <button type="submit" disabled={saving}
                            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
