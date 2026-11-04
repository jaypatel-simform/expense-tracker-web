import { useQueryClient } from '@tanstack/react-query';

/** Roots that also invalidate other roots. Spend changes move the budget status. */
const IMPLIES: Record<string, string[]> = {
  expenses: ['budgets'],
};

/** Invalidate every query whose key starts with one of the given roots (plus implied ones). */
export function useInvalidate() {
  const queryClient = useQueryClient();
  return (...roots: string[]) => {
    const all = new Set(roots.flatMap((root) => [root, ...(IMPLIES[root] ?? [])]));
    return Promise.all([...all].map((root) => queryClient.invalidateQueries({ queryKey: [root] })));
  };
}
