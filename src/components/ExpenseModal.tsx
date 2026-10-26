import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, expensesApi } from '../api/endpoints';
import { errorMessage } from '../api/client';
import { isoToDateInput, today } from '../lib/format';
import type { Expense } from '../types';
import { Button, ErrorText, Field, Input, Select } from './ui';

interface Props {
  expense?: Expense | null;
  onClose: () => void;
}

export default function ExpenseModal({ expense, onClose }: Props) {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });

  const [amount, setAmount] = useState(expense ? String(Number(expense.amount)) : '');
  const [description, setDescription] = useState(expense?.description ?? '');
  const [date, setDate] = useState(expense ? isoToDateInput(expense.date) : today());
  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? '');
  const [note, setNote] = useState(expense?.note ?? '');

  const mutation = useMutation({
    mutationFn: () => {
      const body = {
        amount: Number(amount),
        description: description.trim(),
        date,
        categoryId: categoryId || categories[0]?.id,
        note: note.trim() || undefined,
      };
      return expense ? expensesApi.update(expense.id, body) : expensesApi.create(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      onClose();
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">{expense ? 'Edit expense' : 'Add expense'}</h2>

        <Field label="Description">
          <Input required maxLength={200} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount">
            <Input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Field label="Date">
            <Input required type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
        <Field label="Category">
          <Select required value={categoryId || categories[0]?.id || ''} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Note (optional)">
          <Input maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>

        {mutation.isError && <ErrorText>{errorMessage(mutation.error)}</ErrorText>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending || categories.length === 0}>
            {mutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
}
