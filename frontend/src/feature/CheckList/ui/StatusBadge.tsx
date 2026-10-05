const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  Completed: { bg: 'bg-green-50', text: 'text-emerald-700', label: 'Completed' },
  accepted: { bg: 'bg-sky-50', text: 'text-sky-700', label: 'Accepted' },
  rejected: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Rejected' },
};

export default function StatusBadge({ status }: { status?: string }) {
  const style = STATUS_STYLES[status ?? ''] ?? { bg: 'bg-gray-100', text: 'text-gray-600', label: status ?? 'Unknown' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}