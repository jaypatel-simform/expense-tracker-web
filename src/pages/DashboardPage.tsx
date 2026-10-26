import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/endpoints';
import { currentMonthRange, formatMoney } from '../lib/format';
import { Card, Field, Input } from '../components/ui';

export default function DashboardPage() {
  const [range, setRange] = useState(currentMonthRange);

  const summary = useQuery({
    queryKey: ['reports', 'summary', range],
    queryFn: () => reportsApi.summary(range),
  });
  const monthly = useQuery({ queryKey: ['reports', 'monthly'], queryFn: () => reportsApi.monthly(6) });

  const maxMonthly = Math.max(1, ...(monthly.data ?? []).map((m) => m.total));
  const total = summary.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-3">
          <Field label="From">
            <Input type="date" value={range.from} max={range.to} onChange={(e) => setRange({ ...range, from: e.target.value })} />
          </Field>
          <Field label="To">
            <Input type="date" value={range.to} min={range.from} onChange={(e) => setRange({ ...range, to: e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-slate-500">Total spent</p>
          <p className="mt-1 text-3xl font-semibold">{summary.isLoading ? '...' : formatMoney(total)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Transactions</p>
          <p className="mt-1 text-3xl font-semibold">{summary.isLoading ? '...' : summary.data?.count ?? 0}</p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-medium">By category</h2>
          {summary.isError && <p className="text-sm text-red-600">Failed to load summary</p>}
          {summary.data && summary.data.byCategory.length === 0 && (
            <p className="text-sm text-slate-500">No expenses in this period.</p>
          )}
          <ul className="space-y-3">
            {summary.data?.byCategory.map((c) => (
              <li key={c.categoryId}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{c.name}</span>
                  <span className="text-slate-600">{formatMoney(c.total)}</span>
                </div>
                <div className="h-2 rounded bg-slate-100">
                  <div
                    className="h-2 rounded bg-indigo-500"
                    style={{ width: `${total > 0 ? (c.total / total) * 100 : 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-3 font-medium">Last 6 months</h2>
          {monthly.isError && <p className="text-sm text-red-600">Failed to load monthly totals</p>}
          <div className="flex h-48 items-end gap-3">
            {monthly.data?.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center justify-end gap-1">
                <span className="text-xs text-slate-500">{m.total > 0 ? formatMoney(m.total) : ''}</span>
                <div
                  className="w-full rounded-t bg-indigo-500"
                  style={{ height: `${(m.total / maxMonthly) * 100}%`, minHeight: m.total > 0 ? 4 : 0 }}
                />
                <span className="text-xs text-slate-500">{m.month.slice(2)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
