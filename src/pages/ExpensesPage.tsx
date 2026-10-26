import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, expensesApi } from '../api/endpoints';
import { errorMessage } from '../api/client';
import { formatMoney, isoToDateInput } from '../lib/format';
import type { Expense } from '../types';
import ExpenseModal from '../components/ExpenseModal';
import { Button, Card, ErrorText, Field, Input, Select } from '../components/ui';

const LIMIT = 10;

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ from: '', to: '', categoryId: '' });
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });
  const expenses = useQuery({
    queryKey: ['expenses', filters, page],
    queryFn: () => expensesApi.list({ ...filters, page, limit: LIMIT }),
    placeholderData: keepPreviousData,
  });

  const remove = useMutation({
    mutationFn: (id: string) => expensesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const setFilter = (patch: Partial<typeof filters>) => {
    setFilters({ ...filters, ...patch });
    setPage(1);
  };

  const meta = expenses.data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <Button onClick={() => setCreating(true)}>Add expense</Button>
      </div>

      <Card>
        <div className="grid gap-3 sm:grid-cols-4 sm:items-end">
          <Field label="From">
            <Input type="date" value={filters.from} onChange={(e) => setFilter({ from: e.target.value })} />
          </Field>
          <Field label="To">
            <Input type="date" value={filters.to} onChange={(e) => setFilter({ to: e.target.value })} />
          </Field>
          <Field label="Category">
            <Select value={filters.categoryId} onChange={(e) => setFilter({ categoryId: e.target.value })}>
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Button variant="secondary" onClick={() => { setFilters({ from: '', to: '', categoryId: '' }); setPage(1); }}>
            Clear filters
          </Button>
        </div>
      </Card>

      {remove.isError && <ErrorText>{errorMessage(remove.error)}</ErrorText>}
      {expenses.isError && <ErrorText>{errorMessage(expenses.error)}</ErrorText>}

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {expenses.isLoading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Loading...</td></tr>
            )}
            {expenses.data?.data.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No expenses found.</td></tr>
            )}
            {expenses.data?.data.map((e) => (
              <tr key={e.id} className="border-b border-slate-100 last:border-0">
                <td className="whitespace-nowrap px-4 py-3">{isoToDateInput(e.date)}</td>
                <td className="px-4 py-3">
                  <div>{e.description}</div>
                  {e.note && <div className="text-xs text-slate-500">{e.note}</div>}
                </td>
                <td className="px-4 py-3">{e.category.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium">{formatMoney(e.amount)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button className="mr-3 text-indigo-600 hover:underline" onClick={() => setEditing(e)}>Edit</button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => window.confirm('Delete this expense?') && remove.mutate(e.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {meta && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{meta.total} expense{meta.total === 1 ? '' : 's'}</span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span>Page {meta.page} of {meta.totalPages}</span>
            <Button variant="secondary" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}

      {(creating || editing) && (
        <ExpenseModal
          expense={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
