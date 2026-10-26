import { currentMonth, formatMoney, shiftMonth, toDateInput, todayISO } from './format';

describe('format helpers', () => {
  it('shifts months across year boundaries', () => {
    expect(shiftMonth('2024-01', -1)).toBe('2023-12');
    expect(shiftMonth('2023-12', 1)).toBe('2024-01');
    expect(shiftMonth('2024-03', -14)).toBe('2023-01');
  });

  it('formats the current month and today with zero padding', () => {
    const d = new Date(2024, 2, 5);
    expect(currentMonth(d)).toBe('2024-03');
    expect(todayISO(d)).toBe('2024-03-05');
  });

  it('formats money in the given currency', () => {
    expect(formatMoney(1234.5, 'USD')).toContain('1,234.50');
    expect(formatMoney(5, 'NOPE')).toBe('5.00 NOPE');
  });

  it('extracts the calendar date from an API timestamp', () => {
    expect(toDateInput('2024-03-05T00:00:00.000Z')).toBe('2024-03-05');
  });
});
