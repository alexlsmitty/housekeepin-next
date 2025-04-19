import { Database } from '../supabase/database.types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

// User types
export type User = Tables<'users'>;

// Household types
export type Household = Tables<'households'>;
export type HouseholdMember = Tables<'household_members'>;
export type Invitation = Tables<'invitations'>;

// Task types
export type Task = Tables<'tasks'>;
export type ArchivedTask = Tables<'archived_tasks'>;

// Event types
export type Event = Tables<'events'>;
export type CalendarEvent = Tables<'calendar_events'>;
export type RecurringEvent = Tables<'recurring_events'>;

// Budget types
export type Budget = Tables<'budgets'>;
export type BudgetCategory = Tables<'budget_categories'>;
export type Transaction = Tables<'transactions'>;

// Common props types
export interface WithChildrenProps {
  children: React.ReactNode;
}

export interface WithClassNameProps {
  className?: string;
}

// Form types
export interface TaskFormValues {
  title: string;
  description?: string;
  due_date?: string | null;
  household_id: string;
  assigned_to?: string | null;
  completed?: boolean;
}

export interface EventFormValues {
  title: string;
  description?: string;
  start_date: string;
  end_date?: string | null;
  household_id: string;
}

export interface BudgetFormValues {
  name: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  household_id: string;
}

export interface TransactionFormValues {
  transaction_type: string;
  amount: number;
  description?: string;
  category_id?: string;
  household_id: string;
}

// Error types
export interface ApiError {
  message: string;
  status?: number;
}
