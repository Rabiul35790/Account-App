import { ReactNode } from 'react';

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gray-50 text-gray-300 mb-4">
                {icon}
            </div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-400 max-w-sm mx-auto">{description}</p>
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
