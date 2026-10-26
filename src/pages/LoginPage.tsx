import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessages } from '../api/client';
import { useAuth } from '../auth/authContext';
import { FormError } from '../components/FormError';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type Values = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors: fieldErrors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

  const onSubmit = async (values: Values) => {
    setErrors([]);
    try {
      await login(values.email, values.password);
      navigate(from, { replace: true });
    } catch (e) {
      setErrors(getErrorMessages(e, 'Login failed'));
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1>Log in</h1>
        <FormError messages={errors} />
        <label>
          Email
          <input type="email" autoComplete="email" {...register('email')} />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email.message}</span>}
        </label>
        <label>
          Password
          <input type="password" autoComplete="current-password" {...register('password')} />
          {fieldErrors.password && (
            <span className="field-error">{fieldErrors.password.message}</span>
          )}
        </label>
        <button className="btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
        <p className="muted">
          No account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
