import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  clearCategoryBudget,
  clearOverallBudget,
  getBudgetStatus,
  setCategoryBudget,
  setOverallBudget,
} from '../api/budgets';
import { createCategory, deleteCategory, updateCategory } from '../api/categories';
import { getErrorMessage, getErrorMessages } from '../api/client';
import type { Category } from '../api/types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FormError } from '../components/FormError';
import { Modal } from '../components/Modal';
import { QueryState } from '../components/QueryState';
import { Amount } from '../components/Amount';
import { useBudgets } from '../hooks/useBudgets';
import { useCategories } from '../hooks/useCategories';
import { useInvalidate } from '../hooks/useInvalidate';
import { currentMonth } from '../lib/format';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, 'Max 50 characters'),
});
type Values = z.infer<typeof schema>;

const AMOUNT_MSG = 'Enter a positive amount (max 2 decimals)';
const isValidAmount = (v: string) => /^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0;

/** Inline set / change / clear control for a monthly limit. */
function BudgetAmountForm({
  initial,
  hasLimit,
  label,
  onSave,
  onClear,
  onDone,
}: {
  initial?: number;
  hasLimit: boolean;
  label: string;
  onSave: (amount: number) => Promise<unknown>;
  onClear: () => Promise<unknown>;
  onDone?: () => void;
}) {
  const [value, setValue] = useState(initial !== undefined ? String(initial) : '');
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>, clearing = false) => {
    setErrors([]);
    setBusy(true);
    try {
      await action();
      if (clearing) setValue('');
      onDone?.();
    } catch (e) {
      setErrors(getErrorMessages(e, 'Could not save the budget'));
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    const v = value.trim();
    if (!isValidAmount(v)) {
      setErrors([AMOUNT_MSG]);
      return;
    }
    void run(() => onSave(Number(v)));
  };

  return (
    <form
      className="inline-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="field">
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          aria-label={label}
          autoFocus={!!onDone}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <FormError messages={errors} />
      </div>
      <button type="submit" className="btn" disabled={busy}>
        {busy ? 'Saving…' : 'Save'}
      </button>
      {hasLimit && (
        <button
          type="button"
          className="btn btn-secondary"
          disabled={busy}
          onClick={() => void run(onClear, true)}
        >
          Clear
        </button>
      )}
      {onDone && (
        <button type="button" className="btn btn-secondary" disabled={busy} onClick={onDone}>
          Cancel
        </button>
      )}
    </form>
  );
}

function OverallBudgetCard() {
  const invalidate = useInvalidate();
  // The overall limit is read from the status query (it is not part of the budgets list).
  const status = useQuery({
    queryKey: ['budgets', 'status', currentMonth()],
    queryFn: () => getBudgetStatus(currentMonth()),
  });
  const limit = status.data?.overall?.limit;

  return (
    <section className="card">
      <h2>Monthly budget</h2>
      <p className="muted small">
        Overall limit for all spending each month
        {limit !== undefined && (
          <>
            . Currently <Amount value={limit} />
          </>
        )}
        .
      </p>
      {status.isLoading ? (
        <p className="muted">Loading…</p>
      ) : status.isError ? (
        <p className="error" role="alert">
          Failed to load the budget.{' '}
          <button className="link-btn" onClick={() => void status.refetch()}>
            Retry
          </button>
        </p>
      ) : (
        <BudgetAmountForm
          key={limit ?? 'unset'}
          initial={limit}
          hasLimit={limit !== undefined}
          label="Monthly budget"
          onSave={async (amount) => {
            await setOverallBudget(amount);
            await invalidate('budgets');
          }}
          onClear={async () => {
            await clearOverallBudget();
            await invalidate('budgets');
          }}
        />
      )}
    </section>
  );
}

function BudgetEditor({ category, limit }: { category: Category; limit?: number }) {
  const invalidate = useInvalidate();
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <BudgetAmountForm
        initial={limit}
        hasLimit={limit !== undefined}
        label={`Budget for ${category.name}`}
        onSave={async (amount) => {
          await setCategoryBudget(category.id, amount);
          await invalidate('budgets');
        }}
        onClear={async () => {
          await clearCategoryBudget(category.id);
          await invalidate('budgets');
        }}
        onDone={() => setOpen(false)}
      />
    );
  }
  return (
    <span className="budget-editor">
      {limit !== undefined && (
        <span className="muted small">
          Budget <Amount value={limit} />
        </span>
      )}
      <button
        className="link-btn"
        aria-label={`${limit !== undefined ? 'Change' : 'Set'} budget for ${category.name}`}
        onClick={() => setOpen(true)}
      >
        {limit !== undefined ? 'Change' : 'Set budget'}
      </button>
    </span>
  );
}

function CategoryForm({ category, onDone }: { category?: Category; onDone: () => void }) {
  const invalidate = useInvalidate();
  const [errors, setErrors] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors: fe },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: category?.name ?? '' },
  });
  const mutation = useMutation({
    mutationFn: (v: Values) =>
      category ? updateCategory(category.id, v.name) : createCategory(v.name),
    onSuccess: async () => {
      // Renamed categories show up in expense rows and dashboard breakdowns too.
      await invalidate('categories', 'expenses', 'dashboard');
      onDone();
    },
    onError: (e) => setErrors(getErrorMessages(e, 'Could not save the category')),
  });

  return (
    <form
      className="form"
      noValidate
      onSubmit={handleSubmit((v) => {
        setErrors([]);
        mutation.mutate(v);
      })}
    >
      <FormError messages={errors} />
      <label>
        Name
        <input type="text" autoFocus {...register('name')} />
        {fe.name && <span className="field-error">{fe.name.message}</span>}
      </label>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className="btn" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : category ? 'Save changes' : 'Add category'}
        </button>
      </div>
    </form>
  );
}

export function CategoriesPage() {
  const query = useCategories();
  const budgets = useBudgets();
  const limits = new Map(budgets.data?.map((b) => [b.categoryId, b.amount]));
  const invalidate = useInvalidate();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const remove = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: async () => {
      // Deleting a category cascades to its budget.
      await invalidate('categories', 'budgets');
      setDeleting(null);
    },
  });

  return (
    <div>
      <div className="page-header">
        <h1>Categories</h1>
        <button className="btn" onClick={() => setAdding(true)}>
          Add category
        </button>
      </div>
      <OverallBudgetCard />
      <div className="card">
        <QueryState
          isLoading={query.isLoading}
          isError={query.isError}
          isEmpty={(query.data?.length ?? 0) === 0}
          emptyMessage="No categories."
          onRetry={() => void query.refetch()}
        >
          <ul className="list">
            {query.data?.map((c) => (
              <li key={c.id}>
                <span>
                  {c.name} {c.isDefault && <span className="badge">Default</span>}
                </span>
                <span className="row-actions">
                  <BudgetEditor category={c} limit={limits.get(c.id)} />
                  {!c.isDefault && (
                    <>
                      <button className="link-btn" onClick={() => setEditing(c)}>
                        Edit
                      </button>
                      <button className="link-btn danger" onClick={() => setDeleting(c)}>
                        Delete
                      </button>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </QueryState>
      </div>

      {adding && (
        <Modal title="Add category" onClose={() => setAdding(false)}>
          <CategoryForm onDone={() => setAdding(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit category" onClose={() => setEditing(null)}>
          <CategoryForm category={editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete category"
          message={`Delete "${deleting.name}"?`}
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
