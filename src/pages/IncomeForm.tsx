import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { createIncome, updateIncome } from '../api/income';
import { getErrorMessages } from '../api/client';
import type { Income } from '../api/types';
import { FormError } from '../components/FormError';
import { useInvalidate } from '../hooks/useInvalidate';
import { toDateInput, todayISO } from '../lib/format';

const schema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0, 'Enter a positive amount (max 2 decimals)'),
  date: z.string().min(1, 'Date is required'),
  source: z.string().max(100).optional(),
  note: z.string().max(500).optional(),
});
type Values = z.infer<typeof schema>;

interface Props {
  income?: Income;
  onDone: () => void;
}

export function IncomeForm({ income, onDone }: Props) {
  const invalidate = useInvalidate();
  const [errors, setErrors] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors: fe },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: income
      ? {
          amount: String(income.amount),
          date: toDateInput(income.date),
          source: income.source ?? '',
          note: income.note ?? '',
        }
      : { amount: '', date: todayISO(), source: '', note: '' },
  });

  const mutation = useMutation({
    mutationFn: (v: Values) => {
      const input = {
        amount: Number(v.amount),
        date: v.date,
        source: v.source?.trim() ?? '',
        note: v.note?.trim() ?? '',
      };
      return income ? updateIncome(income.id, input) : createIncome(input);
    },
    onSuccess: async () => {
      await invalidate('income', 'dashboard');
      onDone();
    },
    onError: (e) => setErrors(getErrorMessages(e, 'Could not save the income')),
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
        Source
        <input type="text" placeholder="e.g. Salary" {...register('source')} />
      </label>
      <label>
        Note
        <input type="text" {...register('note')} />
      </label>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className="btn" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : income ? 'Save changes' : 'Add income'}
        </button>
      </div>
    </form>
  );
}
