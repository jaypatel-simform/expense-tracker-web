const pad = (n: number) => String(n).padStart(2, '0');

export function formatMoney(amount: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch {
    // Unknown currency code: fall back to a plain number with the code.
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/** Local today as YYYY-MM-DD (what <input type="date"> uses). */
export function todayISO(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Current month as YYYY-MM. */
export function currentMonth(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
}

/** Shift a YYYY-MM month by delta months (negative = back). */
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const total = y * 12 + (m - 1) + delta;
  return `${Math.floor(total / 12)}-${pad((total % 12) + 1)}`;
}

/** "March 2024" (or "Mar 24" when short). */
export function formatMonthLabel(month: string, short = false): string {
  const [y, m] = month.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, 1));
  return new Intl.DateTimeFormat(undefined, {
    month: short ? 'short' : 'long',
    year: short ? '2-digit' : 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** API timestamps are UTC midnight for date-only input; show the calendar date. */
export function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}

export function formatDate(iso: string): string {
  const [y, m, d] = toDateInput(iso).split('-').map(Number);
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
