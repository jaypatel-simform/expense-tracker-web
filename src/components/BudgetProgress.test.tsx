import { render, screen } from '@testing-library/react';
import { AuthContext, type AuthContextValue } from '../auth/authContext';
import { budgetLevel } from '../lib/budget';
import { BudgetProgress } from './BudgetProgress';

function renderBar(percentUsed: number, large = false, spent = 10, limit = 100) {
  const value: AuthContextValue = {
    token: null,
    user: null,
    loading: false,
    login: async () => {},
    signup: async () => {},
    logout: async () => {},
    setUser: () => {},
  };
  render(
    <AuthContext.Provider value={value}>
      <BudgetProgress
        label="Food"
        spent={spent}
        limit={limit}
        percentUsed={percentUsed}
        large={large}
      />
    </AuthContext.Provider>,
  );
  return screen.getByRole('progressbar');
}

describe('budgetLevel', () => {
  it.each([
    [0, 'ok'],
    [50, 'ok'],
    [79.99, 'ok'],
    [80, 'warning'],
    [100, 'warning'],
    [100.01, 'danger'],
    [250, 'danger'],
  ])('%s%% is %s', (percent, level) => {
    expect(budgetLevel(percent)).toBe(level);
  });
});

describe.each([
  ['category', false],
  ['overall', true],
])('BudgetProgress (%s bar)', (_name, large) => {
  it.each([
    [50, 'ok'],
    [79.99, 'ok'],
    [80, 'warning'],
    [100, 'warning'],
    [100.01, 'danger'],
    [102.5, 'danger'],
  ])('at %s%% uses the %s level', (percent, level) => {
    const bar = renderBar(percent, large);
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill).toHaveAttribute('data-level', level);
    expect(fill).toHaveClass('progress-fill', `level-${level}`);
    expect(bar).toHaveAttribute('aria-valuenow', String(percent));
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar.classList.contains('large')).toBe(large);
  });

  it('caps the fill width at 100%', () => {
    const bar = renderBar(102.5, large, 410, 400);
    expect((bar.firstElementChild as HTMLElement).style.width).toBe('100%');
  });

  it('fills proportionally below the limit', () => {
    const bar = renderBar(25, large, 100, 400);
    expect((bar.firstElementChild as HTMLElement).style.width).toBe('25%');
  });
});

describe('BudgetProgress text', () => {
  it('shows spent / limit, percent and what is left', () => {
    renderBar(25, false, 100, 400);
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('25% used')).toBeInTheDocument();
    expect(screen.getByText(/left/)).toBeInTheDocument();
  });

  it('shows the amount over when above the limit', () => {
    renderBar(102.5, false, 410, 400);
    expect(screen.getByText(/over/)).toBeInTheDocument();
  });
});
