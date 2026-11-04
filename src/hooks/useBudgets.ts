import { useQuery } from '@tanstack/react-query';
import { listBudgets } from '../api/budgets';

export const useBudgets = () => useQuery({ queryKey: ['budgets'], queryFn: listBudgets });
