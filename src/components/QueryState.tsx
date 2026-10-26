import type { ReactNode } from 'react';

interface Props {
  isLoading: boolean;
  isError: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
}

/** Shared loading / error / empty states. */
export function QueryState({
  isLoading,
  isError,
  isEmpty,
  emptyMessage = 'Nothing here yet.',
  onRetry,
  children,
}: Props) {
  if (isLoading) return <p className="muted">Loading…</p>;
  if (isError) {
    return (
      <p className="error" role="alert">
        Failed to load data.{' '}
        {onRetry && (
          <button className="link-btn" onClick={onRetry}>
            Retry
          </button>
        )}
      </p>
    );
  }
  if (isEmpty) return <p className="muted">{emptyMessage}</p>;
  return <>{children}</>;
}
