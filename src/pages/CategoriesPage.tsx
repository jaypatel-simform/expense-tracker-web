import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { createCategory, deleteCategory, updateCategory } from '../api/categories';
import { getErrorMessage, getErrorMessages } from '../api/client';
import type { Category } from '../api/types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FormError } from '../components/FormError';
import { Modal } from '../components/Modal';
import { QueryState } from '../components/QueryState';
import { useCategories } from '../hooks/useCategories';
import { useInvalidate } from '../hooks/useInvalidate';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, 'Max 50 characters'),
});
type Values = z.infer<typeof schema>;

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
  const invalidate = useInvalidate();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const remove = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: async () => {
      await invalidate('categories');
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
                {!c.isDefault && (
                  <span className="row-actions">
                    <button className="link-btn" onClick={() => setEditing(c)}>
                      Edit
                    </button>
                    <button className="link-btn danger" onClick={() => setDeleting(c)}>
                      Delete
                    </button>
                  </span>
                )}
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
