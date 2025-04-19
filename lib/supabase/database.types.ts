export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      archived_tasks: {
        Row: {
          id: string
          household_id: string | null
          title: string | null
          description: string | null
          due_date: string | null
          completed: boolean | null
          archived_at: string | null
        }
        Insert: {
          id?: string
          household_id?: string | null
          title?: string | null
          description?: string | null
          due_date?: string | null
          completed?: boolean | null
          archived_at?: string | null
        }
        Update: {
          id?: string
          household_id?: string | null
          title?: string | null
          description?: string | null
          due_date?: string | null
          completed?: boolean | null
          archived_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "archived_tasks_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          }
        ]
      }
      budget_categories: {
        Row: {
          id: string
          household_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          color: string | null
          monthly_limit: number | null
          category_type: string | null
          budget_id: string | null
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          color?: string | null
          monthly_limit?: number | null
          category_type?: string | null
          budget_id?: string | null
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          color?: string | null
          monthly_limit?: number | null
          category_type?: string | null
          budget_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_categories_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_categories_budget_id_fkey"
            columns: ["budget_id"]
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          }
        ]
      }
      budgets: {
        Row: {
          id: string
          household_id: string
          name: string
          start_date: string
          end_date: string
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          start_date: string
          end_date: string
          total_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          start_date?: string
          end_date?: string
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          }
        ]
      }
      calendar_events: {
        Row: {
          id: string
          household_id: string
          title: string
          description: string | null
          event_date: string
          created_at: string | null
          event_location: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          household_id: string
          title: string
          description?: string | null
          event_date: string
          created_at?: string | null
          event_location?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          household_id?: string
          title?: string
          description?: string | null
          event_date?: string
          created_at?: string | null
          event_location?: string | null
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          start_date: string
          end_date: string | null
          household_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_date: string
          end_date?: string | null
          household_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_date?: string
          end_date?: string | null
          household_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          }
        ]
      }
      household_members: {
        Row: {
          id: string
          household_id: string
          user_id: string
          role: string | null
          joined_at: string | null
        }
        Insert: {
          id?: string
          household_id: string
          user_id: string
          role?: string | null
          joined_at?: string | null
        }
        Update: {
          id?: string
          household_id?: string
          user_id?: string
          role?: string | null
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      households: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string | null
          created_by: string | null
          address: string | null
          member_count: number | null
          latitude: number | null
          longitude: number | null
          geo_location_updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string | null
          created_by?: string | null
          address?: string | null
          member_count?: number | null
          latitude?: number | null
          longitude?: number | null
          geo_location_updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string | null
          created_by?: string | null
          address?: string | null
          member_count?: number | null
          latitude?: number | null
          longitude?: number | null
          geo_location_updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "households_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      invitations: {
        Row: {
          id: string
          household_id: string
          inviter_id: string
          invitee_email: string
          status: string | null
          sent_at: string | null
        }
        Insert: {
          id?: string
          household_id: string
          inviter_id: string
          invitee_email: string
          status?: string | null
          sent_at?: string | null
        }
        Update: {
          id?: string
          household_id?: string
          inviter_id?: string
          invitee_email?: string
          status?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_inviter_id_fkey"
            columns: ["inviter_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      recurring_events: {
        Row: {
          id: string
          title: string
          description: string | null
          start_time: string | null
          end_time: string | null
          start_date: string
          end_date: string | null
          frequency: string
          interval: number | null
          days_of_week: string[] | null
          household_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_time?: string | null
          end_time?: string | null
          start_date: string
          end_date?: string | null
          frequency: string
          interval?: number | null
          days_of_week?: string[] | null
          household_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_time?: string | null
          end_time?: string | null
          start_date?: string
          end_date?: string | null
          frequency?: string
          interval?: number | null
          days_of_week?: string[] | null
          household_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_events_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          household_id: string
          assigned_to: string | null
          title: string
          description: string | null
          due_date: string | null
          completed: boolean | null
          created_at: string | null
          priority: string | null
          status: string | null
        }
        Insert: {
          id?: string
          household_id: string
          assigned_to?: string | null
          title: string
          description?: string | null
          due_date?: string | null
          completed?: boolean | null
          created_at?: string | null
          priority?: string | null
          status?: string | null
        }
        Update: {
          id?: string
          household_id?: string
          assigned_to?: string | null
          title?: string
          description?: string | null
          due_date?: string | null
          completed?: boolean | null
          created_at?: string | null
          priority?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          household_id: string
          category_id: string | null
          transaction_type: string
          amount: number
          description: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          date: string | null
        }
        Insert: {
          id?: string
          household_id: string
          category_id?: string | null
          transaction_type: string
          amount: number
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          date?: string | null
        }
        Update: {
          id?: string
          household_id?: string
          category_id?: string | null
          transaction_type?: string
          amount?: number
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string | null
          onboard_success: boolean | null
          household_id: string | null
          name: string | null
          phone_number: string | null
          bio: string | null
          theme_preference: string | null
          avatar_color: string | null
          notification_preferences: Json | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string | null
          onboard_success?: boolean | null
          household_id?: string | null
          name?: string | null
          phone_number?: string | null
          bio?: string | null
          theme_preference?: string | null
          avatar_color?: string | null
          notification_preferences?: Json | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string | null
          onboard_success?: boolean | null
          household_id?: string | null
          name?: string | null
          phone_number?: string | null
          bio?: string | null
          theme_preference?: string | null
          avatar_color?: string | null
          notification_preferences?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "users_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}