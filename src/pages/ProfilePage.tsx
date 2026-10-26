import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { getErrorMessages } from '../api/client';
import { updateMe } from '../api/users';
import { useAuth } from '../auth/authContext';
import { FormError } from '../components/FormError';

const schema = z.object({
  name: z.string().max(100).optional(),
  defaultCurrency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, 'Use a 3-letter currency code, e.g. USD'),
});
type Values = z.infer<typeof schema>;

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors: fe },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', defaultCurrency: user?.defaultCurrency ?? 'USD' },
  });

  const mutation = useMutation({
    mutationFn: (v: Values) => updateMe({ name: v.name?.trim() ?? '', defaultCurrency: v.defaultCurrency }),
    onSuccess: (me) => {
      setUser(me);
      setSaved(true);
    },
    onError: (e) => setErrors(getErrorMessages(e, 'Could not save your profile')),
  });

  return (
    <div>
      <div className="page-header">
        <h1>Profile</h1>
      </div>
      <form
        className="card form narrow"
        noValidate
        onSubmit={handleSubmit((v) => {
          setErrors([]);
          setSaved(false);
          mutation.mutate(v);
        })}
      >
        <p className="muted">{user?.email}</p>
        <FormError messages={errors} />
        {saved && <p className="success" role="status">Profile saved.</p>}
        <label>
          Name
          <input type="text" {...register('name')} />
        </label>
        <label>
          Default currency
          <input type="text" maxLength={3} {...register('defaultCurrency')} />
          {fe.defaultCurrency && <span className="field-error">{fe.defaultCurrency.message}</span>}
        </label>
        <p className="muted small">Used to display amounts. No conversion is applied.</p>
        <div className="form-actions">
          <button className="btn" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
