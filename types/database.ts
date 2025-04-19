export interface ArchivedTask {
  id: string;
  household_id: string | null;
  title: string | null;
  description: string | null;
  due_date: string | null;
  completed: boolean | null;
  archived_at: string | null;
}

export interface BudgetCategory {
  id: string;
  household_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  color?: string;
  monthly_limit?: number | null;
  category_type?: string;
  budget_id?: string | null;
}

export interface Budget {
  id: string;
  household_id: string;
  name: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Category extends BudgetCategory {
  budgets?: {
    id: string;
    name: string;
    total_amount: number;
  } | null;
}

export interface CalendarEvent {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  event_date: string;
  created_at: string | null;
  event_location: string | null;
  created_by: string | null;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  household_id: string;
  created_at: string | null;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: string | null;
  joined_at: string | null;
}

export interface ExtendedHouseholdMember extends HouseholdMember {
  name?: string | null;
  email?: string | null;
}

export interface Household {
  id: string;
  name: string;
  description: string | null;
  created_at: string | null;
  created_by: string | null;
  address: string | null;
  member_count: number | null;
  latitude?: number | null;
  longitude?: number | null;
  geo_location_updated_at?: string | null;
}

export interface Invitation {
  id: string;
  household_id: string;
  inviter_id: string;
  invitee_email: string;
  status: string | null;
  sent_at: string | null;
  households?: Household;
}

export interface RecurringEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  start_date: string;
  end_date: string | null;
  frequency: string;
  interval: number | null;
  days_of_week: string[] | null;
  household_id: string;
  created_at: string | null;
}

export interface Task {
  id: string;
  household_id: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean | null;
  created_at: string | null;
  priority?: string;
  status?: string;
}

export interface Transaction {
  id: string;
  household_id: string;
  category_id: string | null;
  transaction_type: string;
  amount: number;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  date?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  created_at?: string | null;
  onboard_success?: boolean | null;
  household_id?: string | null;
  name?: string | null;
  phone_number?: string | null;
  bio?: string | null;
  theme_preference?: string | null;
  avatar_color?: string | null;
  notification_preferences?: {
    email: boolean;
    push: boolean;
    sms?: boolean;
  } | null;
}

export interface TaskFormValues {
  title: string;
  description?: string;
  due_date?: string | Date | null;
  completed?: boolean;
  assigned_to?: string | null;
  household_id: string;
  priority?: string;
  status?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
