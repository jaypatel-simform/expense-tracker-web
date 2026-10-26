import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getByCategory, getSummary, getTrend } from '../api/dashboard';
import { useAuth } from '../auth/authContext';
import { Amount } from '../components/Amount';
import { MonthNav } from '../components/MonthNav';
import { QueryState } from '../components/QueryState';
import { currentMonth, formatMoney, formatMonthLabel } from '../lib/format';

const RANGES = [3, 6, 12];

export function ReportsPage() {
  const { user } = useAuth();
  const currency = user?.defaultCurrency ?? 'USD';
  const [month, setMonth] = useState(currentMonth());
  const [months, setMonths] = useState(6);

  // The trend ends at the selected month, so month navigation moves the window.
  const trend = useQuery({
    queryKey: ['dashboard', 'trend', months, month],
    queryFn: () => getTrend(months, month),
  });
  const summary = useQuery({ queryKey: ['dashboard', 'summary', month], queryFn: () => getSummary(month) });
  const byCategory = useQuery({
    queryKey: ['dashboard', 'by-category', month],
    queryFn: () => getByCategory(month),
  });

  const chartData = trend.data?.map((p) => ({ ...p, label: formatMonthLabel(p.month, true) }));

  return (
    <div>
      <div className="page-header">
        <h1>Reports</h1>
        <MonthNav month={month} onChange={setMonth} />
      </div>

      <section className="card">
        <div className="page-header">
          <h2>Monthly spending trend</h2>
          <label className="inline-label">
            Show last
            <select value={months} onChange={(e) => setMonths(Number(e.target.value))}>
              {RANGES.map((r) => (
                <option key={r} value={r}>
                  {r} months
                </option>
              ))}
            </select>
          </label>
        </div>
        <QueryState isLoading={trend.isLoading} isError={trend.isError} onRetry={() => void trend.refetch()}>
          <div className="chart" role="img" aria-label="Monthly spending trend">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(v: number) => formatMoney(v, currency)} width={90} />
                <Tooltip formatter={(v: number) => formatMoney(v, currency)} />
                <Legend />
                <Bar dataKey="spent" name="Spent" fill="#ef4444" />
                <Bar dataKey="income" name="Income" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </QueryState>
      </section>

      <section className="card">
        <h2>{formatMonthLabel(month)} breakdown</h2>
        {summary.data && (
          <p>
            Spent <Amount value={summary.data.spent} /> · Income <Amount value={summary.data.income} /> · Balance{' '}
            <Amount value={summary.data.balance} />
          </p>
        )}
        <QueryState
          isLoading={byCategory.isLoading}
          isError={byCategory.isError}
          isEmpty={byCategory.data?.length === 0}
          emptyMessage="No expenses this month."
          onRetry={() => void byCategory.refetch()}
        >
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th className="num">Total</th>
                <th className="num">Share</th>
              </tr>
            </thead>
            <tbody>
              {byCategory.data?.map((c) => (
                <tr key={c.categoryId}>
                  <td>{c.name}</td>
                  <td className="num">
                    <Amount value={c.total} />
                  </td>
                  <td className="num">{c.percentage.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </QueryState>
      </section>
    </div>
  );
}
