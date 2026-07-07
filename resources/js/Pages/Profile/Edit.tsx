import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Edit({ status }: { status?: string }) {
    const user = usePage().props.auth.user;

    const profileForm = useForm({ name: user.name, email: user.email });
    const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' });

    const updateProfile: FormEventHandler = (e) => {
        e.preventDefault();
        profileForm.patch(route('profile.update'), { preserveScroll: true });
    };

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();
        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
            onError: (err) => {
                if (err.password) passwordForm.reset('password', 'password_confirmation');
                if (err.current_password) passwordForm.reset('current_password');
            },
        });
    };

    const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors";
    const labelClass = "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider";

    return (
        <AuthenticatedLayout>
            <Head title="Profile" />
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                    <p className="text-sm text-gray-400 mt-1">Update your name, email, and password</p>
                </div>

                <div className="space-y-6">
                    <form onSubmit={updateProfile} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-5">Profile Information</h2>
                        <p className="text-sm text-gray-400 mb-4">Update your account's profile information and email address.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className={labelClass}>Name</label>
                                <input type="text" value={profileForm.data.name} onChange={e => profileForm.setData('name', e.target.value)} required className={inputClass} />
                                {profileForm.errors.name && <p className="text-sm text-rose-600 mt-1">{profileForm.errors.name}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Email</label>
                                <input type="email" value={profileForm.data.email} onChange={e => profileForm.setData('email', e.target.value)} required className={inputClass} />
                                {profileForm.errors.email && <p className="text-sm text-rose-600 mt-1">{profileForm.errors.email}</p>}
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={profileForm.processing}
                                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                                {profileForm.processing ? 'Saving...' : 'Update Profile'}
                            </button>
                        </div>
                        {profileForm.recentlySuccessful && <p className="text-sm text-emerald-600 mt-2 text-right">Saved.</p>}
                    </form>

                    <form onSubmit={updatePassword} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-5">Update Password</h2>
                        <p className="text-sm text-gray-400 mb-4">Ensure your account is using a long, random password to stay secure.</p>
                        <div className="space-y-4 max-w-md">
                            <div>
                                <label className={labelClass}>Current Password</label>
                                <input type="password" value={passwordForm.data.current_password} onChange={e => passwordForm.setData('current_password', e.target.value)} required className={inputClass} />
                                {passwordForm.errors.current_password && <p className="text-sm text-rose-600 mt-1">{passwordForm.errors.current_password}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>New Password</label>
                                <input type="password" value={passwordForm.data.password} onChange={e => passwordForm.setData('password', e.target.value)} required minLength={8} className={inputClass} />
                                {passwordForm.errors.password && <p className="text-sm text-rose-600 mt-1">{passwordForm.errors.password}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Confirm New Password</label>
                                <input type="password" value={passwordForm.data.password_confirmation} onChange={e => passwordForm.setData('password_confirmation', e.target.value)} required minLength={8} className={inputClass} />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button type="submit" disabled={passwordForm.processing}
                                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                                {passwordForm.processing ? 'Saving...' : 'Update Password'}
                            </button>
                        </div>
                        {passwordForm.recentlySuccessful && <p className="text-sm text-emerald-600 mt-2 text-right">Saved.</p>}
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
