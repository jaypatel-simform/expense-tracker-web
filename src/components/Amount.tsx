import { useAuth } from '../auth/authContext';
import { formatMoney } from '../lib/format';

/** Formats an amount using the signed-in user's default currency. */
export function Amount({ value, className }: { value: number; className?: string }) {
  const { user } = useAuth();
  return <span className={className}>{formatMoney(value, user?.defaultCurrency ?? 'USD')}</span>;
}
