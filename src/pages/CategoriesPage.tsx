import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api/endpoints';
import { errorMessage } from '../api/client';
import { Button, Card, ErrorText, Input } from '../components/ui';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['categories'] });

  const create = useMutation({
    mutationFn: (n: string) => categoriesApi.create(n),
    onSuccess: () => { setName(''); refresh(); },
  });
  const remove = useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: refresh,
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) create.mutate(name.trim());
  };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Categories</h1>

      <Card>
        <form onSubmit={submit} className="flex gap-2">
          <Input placeholder="New category name" maxLength={50} value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" disabled={create.isPending}>Add</Button>
        </form>
      </Card>

      {create.isError && <ErrorText>{errorMessage(create.error)}</ErrorText>}
      {remove.isError && <ErrorText>{errorMessage(remove.error)}</ErrorText>}

      <Card className="p-0">
        {isLoading && <p className="p-4 text-sm text-slate-500">Loading...</p>}
        <ul>
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0">
              <span>{c.name}</span>
              <button
                className="text-sm text-red-600 hover:underline"
                onClick={() => window.confirm(`Delete "${c.name}"?`) && remove.mutate(c.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
