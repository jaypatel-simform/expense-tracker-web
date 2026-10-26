import { currentMonth, formatMonthLabel, shiftMonth } from '../lib/format';

interface Props {
  month: string;
  onChange: (month: string) => void;
}

export function MonthNav({ month, onChange }: Props) {
  const isCurrent = month >= currentMonth();
  return (
    <div className="month-nav">
      <button
        className="btn btn-secondary"
        aria-label="Previous month"
        onClick={() => onChange(shiftMonth(month, -1))}
      >
        ‹
      </button>
      <strong aria-live="polite">{formatMonthLabel(month)}</strong>
      <button
        className="btn btn-secondary"
        aria-label="Next month"
        disabled={isCurrent}
        onClick={() => onChange(shiftMonth(month, 1))}
      >
        ›
      </button>
    </div>
  );
}
