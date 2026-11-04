import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useInvalidate } from './useInvalidate';

function setup() {
  const client = new QueryClient();
  const spy = vi.spyOn(client, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useInvalidate(), { wrapper });
  return { invalidate: result.current, spy };
}

const roots = (spy: ReturnType<typeof setup>['spy']) =>
  spy.mock.calls.map((c) => (c[0]?.queryKey as string[])[0]).sort();

describe('useInvalidate', () => {
  it('also refreshes budgets when expenses change', async () => {
    const { invalidate, spy } = setup();
    await invalidate('expenses', 'dashboard');
    expect(roots(spy)).toEqual(['budgets', 'dashboard', 'expenses']);
  });

  it('does not duplicate roots', async () => {
    const { invalidate, spy } = setup();
    await invalidate('expenses', 'budgets');
    expect(roots(spy)).toEqual(['budgets', 'expenses']);
  });

  it('leaves unrelated roots alone', async () => {
    const { invalidate, spy } = setup();
    await invalidate('income');
    expect(roots(spy)).toEqual(['income']);
  });
});
