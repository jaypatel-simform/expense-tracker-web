import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessages } from '../api/client';
import { useAuth } from '../auth/authContext';
import { FormError } from '../components/FormError';

const schema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});
type Values = z.infer<typeof schema>;

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors: fieldErrors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    setErrors([]);
    try {
      await signup({
        email: values.email,
        password: values.password,
        name: values.name?.trim() || undefined,
      });
      navigate('/', { replace: true });
    } catch (e) {
      setErrors(getErrorMessages(e, 'Sign up failed'));
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1>Create account</h1>
        <FormError messages={errors} />
        <label>
          Name (optional)
          <input type="text" autoComplete="name" {...register('name')} />
        </label>
        <label>
          Email
          <input type="email" autoComplete="email" {...register('email')} />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email.message}</span>}
        </label>
        <label>
          Password
          <input type="password" autoComplete="new-password" {...register('password')} />
          {fieldErrors.password && (
            <span className="field-error">{fieldErrors.password.message}</span>
          )}
        </label>
        <button className="btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Sign up'}
        </button>
        <p className="muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
