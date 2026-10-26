import { forwardRef, type SelectHTMLAttributes } from 'react';
import { useCategories } from '../hooks/useCategories';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Label for the empty option (e.g. "All categories"). */
  placeholder?: string;
}

export const CategoryPicker = forwardRef<HTMLSelectElement, Props>(function CategoryPicker(
  { placeholder = 'Select a category', ...rest },
  ref,
) {
  const { data, isLoading, isError } = useCategories();
  return (
    <select ref={ref} {...rest} disabled={rest.disabled || isLoading}>
      <option value="">{isLoading ? 'Loading…' : isError ? 'Failed to load' : placeholder}</option>
      {data?.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
});
