import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { createExpense, updateExpense } from '../api/expenses';
import { getErrorMessages } from '../api/client';
import { PAYMENT_METHODS, type Expense } from '../api/types';
import { CategoryPicker } from '../components/CategoryPicker';
import { FormError } from '../components/FormError';
import { useInvalidate } from '../hooks/useInvalidate';
import { toDateInput, todayISO } from '../lib/format';

const schema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0, 'Enter a positive amount (max 2 decimals)'),
  date: z.string().min(1, 'Date is required'),
  categoryId: z.string().min(1, 'Pick a category'),
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'OTHER']),
  note: z.string().max(500).optional(),
});
type Values = z.infer<typeof schema>;

interface Props {
  expense?: Expense;
  onDone: () => void;
}

export function ExpenseForm({ expense, onDone }: Props) {
  const invalidate = useInvalidate();
  const [errors, setErrors] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors: fe },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: expense
      ? {
          amount: String(expense.amount),
          date: toDateInput(expense.date),
          categoryId: expense.categoryId,
          paymentMethod: expense.paymentMethod,
          note: expense.note ?? '',
        }
      : { amount: '', date: todayISO(), categoryId: '', paymentMethod: 'CASH', note: '' },
  });

  const mutation = useMutation({
    mutationFn: (v: Values) => {
      const input = {
        amount: Number(v.amount),
        date: v.date,
        categoryId: v.categoryId,
        paymentMethod: v.paymentMethod,
        note: v.note?.trim() ?? '',
      };
      return expense ? updateExpense(expense.id, input) : createExpense(input);
    },
    onSuccess: async () => {
      await invalidate('expenses', 'dashboard');
      onDone();
    },
    onError: (e) => setErrors(getErrorMessages(e, 'Could not save the expense')),
  });

  return (
    <form
      className="form"
      onSubmit={handleSubmit((v) => {
        setErrors([]);
        mutation.mutate(v);
      })}
      noValidate
    >
      <FormError messages={errors} />
      <label>
        Amount
        <input type="text" inputMode="decimal" placeholder="0.00" {...register('amount')} />
        {fe.amount && <span className="field-error">{fe.amount.message}</span>}
      </label>
      <label>
        Date
        <input type="date" {...register('date')} />
        {fe.date && <span className="field-error">{fe.date.message}</span>}
      </label>
      <label>
        Category
        <CategoryPicker {...register('categoryId')} />
        {fe.categoryId && <span className="field-error">{fe.categoryId.message}</span>}
      </label>
      <label>
        Payment method
        <select {...register('paymentMethod')}>
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Note
        <input type="text" {...register('note')} />
        {fe.note && <span className="field-error">{fe.note.message}</span>}
      </label>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className="btn" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : expense ? 'Save changes' : 'Add expense'}
        </button>
      </div>
    </form>
  );
}
