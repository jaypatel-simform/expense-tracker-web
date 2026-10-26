import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteIncome, listIncome } from '../api/income';
import { getErrorMessage } from '../api/client';
import type { Income } from '../api/types';
import { Amount } from '../components/Amount';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { QueryState } from '../components/QueryState';
import { useInvalidate } from '../hooks/useInvalidate';
import { formatDate } from '../lib/format';
import { IncomeForm } from './IncomeForm';

const PAGE_SIZE = 10;

export function IncomePage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);
  const [deleting, setDeleting] = useState<Income | null>(null);
  const invalidate = useInvalidate();

  const filters = { page, limit: PAGE_SIZE };
  const query = useQuery({
    queryKey: ['income', filters],
    queryFn: () => listIncome(filters),
    placeholderData: (prev) => prev,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteIncome(id),
    onSuccess: async () => {
      await invalidate('income', 'dashboard');
      setDeleting(null);
    },
  });

  const rows = query.data?.data ?? [];

  return (
    <div>
      <div className="page-header">
        <h1>Income</h1>
        <button className="btn" onClick={() => setAdding(true)}>
          Add income
        </button>
      </div>

      <div className="card">
        <QueryState
          isLoading={query.isLoading}
          isError={query.isError}
          isEmpty={rows.length === 0}
          emptyMessage="No income recorded yet."
          onRetry={() => void query.refetch()}
        >
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Note</th>
                <th className="num">Amount</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id}>
                  <td>{formatDate(i.date)}</td>
                  <td>{i.source}</td>
                  <td>{i.note}</td>
                  <td className="num">
                    <Amount value={i.amount} />
                  </td>
                  <td className="row-actions">
                    <button className="link-btn" onClick={() => setEditing(i)}>
                      Edit
                    </button>
                    <button className="link-btn danger" onClick={() => setDeleting(i)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {query.data && (
            <Pagination
              meta={query.data.meta}
              onPageChange={(p) => setParams(p > 1 ? { page: String(p) } : {}, { replace: true })}
            />
          )}
        </QueryState>
      </div>

      {adding && (
        <Modal title="Add income" onClose={() => setAdding(false)}>
          <IncomeForm onDone={() => setAdding(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit income" onClose={() => setEditing(null)}>
          <IncomeForm income={editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete income"
          message="Delete this income entry? This cannot be undone."
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
