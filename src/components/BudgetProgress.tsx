import { budgetLevel } from '../lib/budget';
import { Amount } from './Amount';

interface Props {
  label: string;
  spent: number;
  limit: number;
  percentUsed: number;
  large?: boolean;
}

export function BudgetProgress({ label, spent, limit, percentUsed, large }: Props) {
  const level = budgetLevel(percentUsed);
  const width = Math.max(0, Math.min(percentUsed, 100));
  const left = limit - spent;
  return (
    <div className={`budget-item${large ? ' large' : ''}`} data-testid="budget-item">
      <div className="budget-head">
        <strong className="budget-label">{label}</strong>
        <span className="budget-amounts">
          <Amount value={spent} /> / <Amount value={limit} />
        </span>
      </div>
      <div
        className={`progress${large ? ' large' : ''}`}
        role="progressbar"
        aria-label={`${label} budget used`}
        aria-valuenow={percentUsed}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`progress-fill level-${level}`}
          data-level={level}
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="budget-foot muted small">
        <span>{percentUsed}% used</span>
        <span className={left < 0 ? 'negative' : undefined}>
          <Amount value={Math.abs(left)} /> {left < 0 ? 'over' : 'left'}
        </span>
      </div>
    </div>
  );
}
