export type BudgetLevel = 'ok' | 'warning' | 'danger';

/** ok below 80%, warning from 80% up to and including 100%, danger above 100%. */
export function budgetLevel(percent: number): BudgetLevel {
  if (percent > 100) return 'danger';
  if (percent >= 80) return 'warning';
  return 'ok';
}
