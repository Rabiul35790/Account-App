import { useEffect, useState } from 'react';

interface ConfirmModalProps {
    show: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmClass?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({ show, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', confirmClass = 'bg-rose-600 hover:bg-rose-700', onConfirm, onCancel }: ConfirmModalProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (show) {
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
        }
    }, [show]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`} onClick={onCancel} />
            <div className={`relative w-full max-w-sm bg-white rounded-2xl shadow-2xl transform transition-all duration-200 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="p-6">
                    <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
                    <div className="flex gap-3">
                        <button onClick={onCancel} className="flex-1 py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            {cancelLabel}
                        </button>
                        <button onClick={onConfirm} className={`flex-1 py-2.5 px-4 text-white text-sm font-medium rounded-lg transition-colors ${confirmClass}`}>
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
