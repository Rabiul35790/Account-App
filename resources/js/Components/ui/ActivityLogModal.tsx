import { useState, useEffect } from 'react';
import Modal from './Modal';

interface LogEntry {
    id: number;
    event: string;
    user: { id: number; name: string } | null;
    created_at: string;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
}

interface ActivityLogModalProps {
    show: boolean;
    onClose: () => void;
    subjectType: string;
    subjectId: number;
    title: string;
}

export default function ActivityLogModal({ show, onClose, subjectType, subjectId, title }: ActivityLogModalProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && subjectId) {
            setLoading(true);
            fetch(`/api/activity-logs?subject_type=${encodeURIComponent(subjectType)}&subject_id=${subjectId}`)
                .then(r => r.json())
                .then(data => setLogs(data))
                .finally(() => setLoading(false));
        }
    }, [show, subjectId, subjectType]);

    const eventColors: Record<string, string> = {
        created: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        updated: 'bg-blue-50 text-blue-700 border-blue-200',
        deleted: 'bg-rose-50 text-rose-700 border-rose-200',
        restored: 'bg-purple-50 text-purple-700 border-purple-200',
    };

    const eventIcons: Record<string, string> = {
        created: '+',
        updated: '~',
        deleted: '-',
        restored: 'R',
    };

    return (
        <Modal show={show} onClose={onClose} title={`Activity Log: ${title}`} maxWidth="max-w-2xl">
            {loading ? (
                <div className="flex justify-center py-8">
                    <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">No activity recorded for this record.</div>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {logs.map(log => (
                        <div key={log.id} className={`flex items-start gap-3 p-3 rounded-lg border ${eventColors[log.event] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-white/80 border">
                                {eventIcons[log.event] || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium capitalize">{log.event}</span>
                                    <span className="text-xs opacity-60">by {log.user?.name || 'System'}</span>
                                    <span className="text-xs opacity-60 ml-auto">{new Date(log.created_at).toLocaleString()}</span>
                                </div>
                                {log.old_values && log.new_values && (
                                    <div className="mt-1.5 text-xs space-y-1">
                                        {Object.entries(log.new_values).filter(([k]) => !['id', 'created_at', 'updated_at', 'deleted_at', 'created_by', 'updated_by', 'deleted_by', 'user_id'].includes(k)).map(([key, val]) => {
                                            const oldVal = log.old_values?.[key];
                                            if (oldVal === val) return null;
                                            return (
                                                <div key={key} className="flex gap-2">
                                                    <span className="text-gray-500 capitalize min-w-[80px]">{key.replace(/_/g, ' ')}:</span>
                                                    <span className="text-rose-600 line-through">{oldVal !== null ? String(oldVal) : '—'}</span>
                                                    <span className="text-emerald-600">{val !== null ? String(val) : '—'}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    );
}
