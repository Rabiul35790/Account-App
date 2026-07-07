import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const { settings } = usePage().props as any;
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:focus:border-indigo-500 transition-colors";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Head title="Log in" />
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    {settings?.logo_url ? (
                        <img src={settings.logo_url} alt="Logo" className="h-12 mx-auto mb-4" />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                            <span className="text-white text-lg font-bold">{import.meta.env.VITE_APP_NAME?.charAt(0) || 'A'}</span>
                        </div>
                    )}
                    <h1 className="text-xl font-bold text-gray-900">{import.meta.env.VITE_APP_NAME || 'Account'}</h1>
                    <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
                </div>

                {status && <div className="mb-4 text-sm font-medium text-green-600 text-center">{status}</div>}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider" htmlFor="email">Email</label>
                            <input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} required autoFocus autoComplete="username" className={inputClass} />
                            {errors.email && <p className="text-sm text-rose-600 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider" htmlFor="password">Password</label>
                            <input id="password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} required autoComplete="current-password" className={inputClass} />
                            {errors.password && <p className="text-sm text-rose-600 mt-1">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={data.remember} onChange={e => setData('remember', (e.target.checked || false) as false)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm text-gray-500">Remember me</span>
                            </label>
                            {canResetPassword && (
                                <Link href={route('password.request')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <button type="submit" disabled={processing}
                            className="w-full py-2.5 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                            {processing ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
