import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteExpense, listExpenses } from '../api/expenses';
import { getErrorMessage } from '../api/client';
import { PAYMENT_METHODS, type Expense } from '../api/types';
import { Amount } from '../components/Amount';
import { CategoryPicker } from '../components/CategoryPicker';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { QueryState } from '../components/QueryState';
import { useDebounced } from '../hooks/useDebounced';
import { useInvalidate } from '../hooks/useInvalidate';
import { formatDate } from '../lib/format';
import { ExpenseForm } from './ExpenseForm';

const PAGE_SIZE = 10;
const methodLabel = (m: string) => PAYMENT_METHODS.find((p) => p.value === m)?.label ?? m;

export function ExpensesPage() {
  const [params, setParams] = useSearchParams();
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  const categoryId = params.get('categoryId') ?? '';
  const search = params.get('search') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);

  // Keep typing responsive; push to the URL (and the query) after a pause.
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounced(searchInput);

  const update = (changes: Record<string, string>, resetPage = true) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [k, v] of Object.entries(changes)) {
          if (v) next.set(k, v);
          else next.delete(k);
        }
        if (resetPage) next.delete('page');
        return next;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    if (debouncedSearch !== search) update({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const [editing, setEditing] = useState<Expense | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const invalidate = useInvalidate();

  const filters = {
    page,
    limit: PAGE_SIZE,
    from: from || undefined,
    to: to || undefined,
    categoryId: categoryId || undefined,
    search: search || undefined,
  };
  const query = useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => listExpenses(filters),
    placeholderData: (prev) => prev,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: async () => {
      await invalidate('expenses', 'dashboard');
      setDeleting(null);
    },
  });

  const hasFilters = Boolean(from || to || categoryId || search);
  const rows = query.data?.data ?? [];

  return (
    <div>
      <div className="page-header">
        <h1>Expenses</h1>
        <button className="btn" onClick={() => setAdding(true)}>
          Add expense
        </button>
      </div>

      <div className="card filters">
        <label>
          From
          <input type="date" value={from} max={to || undefined} onChange={(e) => update({ from: e.target.value })} />
        </label>
        <label>
          To
          <input type="date" value={to} min={from || undefined} onChange={(e) => update({ to: e.target.value })} />
        </label>
        <label>
          Category
          <CategoryPicker
            placeholder="All categories"
            value={categoryId}
            onChange={(e) => update({ categoryId: e.target.value })}
          />
        </label>
        <label>
          Search notes
          <input
            type="search"
            placeholder="Search…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </label>
        {hasFilters && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSearchInput('');
              setParams({}, { replace: true });
            }}
          >
            Clear
          </button>
        )}
      </div>

      <div className="card">
        <QueryState
          isLoading={query.isLoading}
          isError={query.isError}
          isEmpty={rows.length === 0}
          emptyMessage={hasFilters ? 'No expenses match these filters.' : 'No expenses yet. Add your first one!'}
          onRetry={() => void query.refetch()}
        >
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Note</th>
                <th>Payment</th>
                <th className="num">Amount</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td>{formatDate(e.date)}</td>
                  <td>{e.category.name}</td>
                  <td>{e.note}</td>
                  <td>{methodLabel(e.paymentMethod)}</td>
                  <td className="num">
                    <Amount value={e.amount} />
                  </td>
                  <td className="row-actions">
                    <button className="link-btn" onClick={() => setEditing(e)}>
                      Edit
                    </button>
                    <button className="link-btn danger" onClick={() => setDeleting(e)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {query.data && (
            <Pagination meta={query.data.meta} onPageChange={(p) => update({ page: p > 1 ? String(p) : '' }, false)} />
          )}
        </QueryState>
      </div>

      {adding && (
        <Modal title="Add expense" onClose={() => setAdding(false)}>
          <ExpenseForm onDone={() => setAdding(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit expense" onClose={() => setEditing(null)}>
          <ExpenseForm expense={editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete expense"
          message="Delete this expense? This cannot be undone."
          busy={remove.isPending}
          error={remove.isError ? getErrorMessage(remove.error) : null}
          onConfirm={() => remove.mutate(deleting.id)}
          onCancel={() => {
            remove.reset();
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
