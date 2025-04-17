export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name?: string;
          full_name?: string;
          email?: string;
          household_id?: string;
          onboard_success?: boolean;
          created_at?: string;
        };
        Insert: {
          id?: string;
          name?: string;
          full_name?: string;
          email?: string;
          household_id?: string;
          onboard_success?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          full_name?: string;
          email?: string;
          household_id?: string;
          onboard_success?: boolean;
        };
      };
      households: {
        Row: {
          id: string;
          name: string;
          address?: string;
          member_count?: number;
          created_at?: string;
          created_by?: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string;
          member_count?: number;
          created_by?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          member_count?: number;
          created_by?: string;
        };
      };
      household_members: {
        Row: {
          id: string;
          household_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          user_id: string;
          role?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          user_id?: string;
          role?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description?: string;
          due_date?: string;
          completed?: boolean;
          household_id: string;
          assigned_to?: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          due_date?: string;
          completed?: boolean;
          household_id: string;
          assigned_to?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          due_date?: string;
          completed?: boolean;
          household_id?: string;
          assigned_to?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description?: string;
          start_date: string;
          end_date?: string;
          household_id: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          start_date: string;
          end_date?: string;
          household_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          start_date?: string;
          end_date?: string;
          household_id?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};
