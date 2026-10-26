import { useQueryClient } from '@tanstack/react-query';

/** Invalidate every query whose key starts with one of the given roots. */
export function useInvalidate() {
  const queryClient = useQueryClient();
  return (...roots: string[]) =>
    Promise.all(roots.map((root) => queryClient.invalidateQueries({ queryKey: [root] })));
}
