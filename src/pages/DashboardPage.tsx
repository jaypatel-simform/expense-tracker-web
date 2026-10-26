import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getByCategory, getRecent, getSummary } from '../api/dashboard';
import { Amount } from '../components/Amount';
import { CategoryDonut } from '../components/CategoryDonut';
import { MonthNav } from '../components/MonthNav';
import { QueryState } from '../components/QueryState';
import { currentMonth, formatDate } from '../lib/format';

export function DashboardPage() {
  const [month, setMonth] = useState(currentMonth());
  const summary = useQuery({ queryKey: ['dashboard', 'summary', month], queryFn: () => getSummary(month) });
  const byCategory = useQuery({
    queryKey: ['dashboard', 'by-category', month],
    queryFn: () => getByCategory(month),
  });
  const recent = useQuery({ queryKey: ['dashboard', 'recent'], queryFn: () => getRecent(10) });

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <MonthNav month={month} onChange={setMonth} />
      </div>

      <QueryState isLoading={summary.isLoading} isError={summary.isError} onRetry={() => void summary.refetch()}>
        {summary.data && (
          <div className="cards">
            <div className="card summary-card">
              <span className="muted">Spent</span>
              <strong className="negative">
                <Amount value={summary.data.spent} />
              </strong>
            </div>
            <div className="card summary-card">
              <span className="muted">Income</span>
              <strong className="positive">
                <Amount value={summary.data.income} />
              </strong>
            </div>
            <div className="card summary-card">
              <span className="muted">Balance</span>
              <strong className={summary.data.balance < 0 ? 'negative' : 'positive'}>
                <Amount value={summary.data.balance} />
              </strong>
            </div>
          </div>
        )}
      </QueryState>

      <div className="grid-2">
        <section className="card">
          <h2>Spending by category</h2>
          <QueryState
            isLoading={byCategory.isLoading}
            isError={byCategory.isError}
            isEmpty={byCategory.data?.length === 0}
            emptyMessage="No expenses this month."
            onRetry={() => void byCategory.refetch()}
          >
            {byCategory.data && <CategoryDonut data={byCategory.data} />}
          </QueryState>
        </section>

        <section className="card">
          <h2>Recent transactions</h2>
          <QueryState
            isLoading={recent.isLoading}
            isError={recent.isError}
            isEmpty={recent.data?.length === 0}
            emptyMessage="No transactions yet."
            onRetry={() => void recent.refetch()}
          >
            <ul className="list">
              {recent.data?.map((t) => (
                <li key={`${t.type}-${t.id}`}>
                  <span>
                    <strong>{t.type === 'expense' ? t.category.name : t.source || 'Income'}</strong>
                    <span className="muted"> · {formatDate(t.date)}</span>
                    {t.note && <div className="muted small">{t.note}</div>}
                  </span>
                  <Amount value={t.type === 'expense' ? -t.amount : t.amount} className={t.type === 'expense' ? 'negative' : 'positive'} />
                </li>
              ))}
            </ul>
          </QueryState>
        </section>
      </div>
    </div>
  );
}
