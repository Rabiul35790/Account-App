import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    const { settings } = usePage().props as any;

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-50 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    {settings?.logo_url ? (
                        <img src={settings.logo_url} alt="Logo" className="h-16 w-auto" />
                    ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">{import.meta.env.VITE_APP_NAME?.charAt(0) || 'A'}</span>
                        </div>
                    )}
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-sm sm:max-w-md sm:rounded-xl border border-gray-200">
                {children}
            </div>
        </div>
    );
}
