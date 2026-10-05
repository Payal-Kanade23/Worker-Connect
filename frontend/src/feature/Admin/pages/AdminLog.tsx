// frontend/AdminLogs.tsx
// Admin "Recent Activity" page. Fetches from GET /api/admin/logs.
// Styled with Tailwind CSS utility classes — no separate stylesheet needed.
// Assumes you have a way to attach auth (cookie session or Authorization
// header) to fetch calls — adjust API_BASE and the fetch options as needed.

import React, { useEffect, useState, useCallback, Fragment } from 'react';
import { getAuditLogs, type ActivityLog } from '../api/admin.api';

import type { Filters } from '../api/admin.api';







function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    action: '',
    startDate: '',
    endDate: '',
  });

  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Filters = { page, limit: 25 };
if (filters.search) params.search = filters.search;
if (filters.action) params.action = filters.action;
if (filters.startDate) params.startDate = filters.startDate;
if (filters.endDate) params.endDate = filters.endDate;

const data = await getAuditLogs(params); // ✅ matches Filters
     
      setLogs(data.logs);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    
  }, []);

  function handleFilterChange(field: keyof Filters, value: string) {
    setPage(1);
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 font-sans text-slate-900">
      <header className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold">Recent activity</h1>
          <p className="mt-1 text-sm text-slate-500">
            {total.toLocaleString()} logged event{total === 1 ? '' : 's'}
          </p>
        </div>
        <button
          className="rounded-md bg-slate-900 px-3.5 py-2 text-sm text-white disabled:opacity-50"
          onClick={fetchLogs}
          disabled={loading}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Search description or email"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="min-w-[200px] flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
        />

        <select
          value={filters.action}
          onChange={(e) => handleFilterChange('action', e.target.value)}
          className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
        >
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
        />
        <span className="text-sm text-slate-400">to</span>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
        />
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="border-b border-slate-200 px-3.5 py-2.5 text-left font-semibold text-slate-600">Time</th>
              <th className="border-b border-slate-200 px-3.5 py-2.5 text-left font-semibold text-slate-600">User</th>
              <th className="border-b border-slate-200 px-3.5 py-2.5 text-left font-semibold text-slate-600">Action</th>
              <th className="border-b border-slate-200 px-3.5 py-2.5 text-left font-semibold text-slate-600">Description</th>
              <th className="border-b border-slate-200 px-3.5 py-2.5 text-left font-semibold text-slate-600">IP address</th>
            </tr>
          </thead>
          <tbody>
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3.5 py-8 text-center text-slate-400">
                  No activity matches these filters.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <Fragment key={log.id}>
                <tr
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                >
                  <td className="whitespace-nowrap border-b border-slate-100 px-3.5 py-2.5 font-mono text-xs text-slate-500">
                    {formatTimestamp(log.created_at)}
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-2.5">{log.user_email || '—'}</td>
                  <td className="border-b border-slate-100 px-3.5 py-2.5">
                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-3.5 py-2.5">{log.description || '—'}</td>
                  <td className="whitespace-nowrap border-b border-slate-100 px-3.5 py-2.5 font-mono text-xs text-slate-500">
                    {log.ip_address || '—'}
                  </td>
                </tr>
                {expandedRow === log.id && (
                  <tr className="bg-slate-50/70">
                    <td colSpan={5} className="border-b border-slate-100 px-3.5 py-3">
                      <div className="flex flex-col gap-1 text-xs text-slate-600">
                        <div>
                          <strong>Entity:</strong> {log.entity_type || '—'} {log.entity_id ? `#${log.entity_id}` : ''}
                        </div>
                        <div><strong>User agent:</strong> {log.user_agent || '—'}</div>
                        {log.metadata && (
                          <pre className="mt-1 overflow-x-auto rounded-md bg-slate-900 p-2.5 text-xs text-slate-200">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-center justify-center gap-4 text-sm text-slate-600">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40"
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}