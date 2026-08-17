export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      featured_recipes: {
        Row: {
          content: string | null
          cook_time_minutes: number
          cost_per_portion: number | null
          created_at: string
          cuisine: string | null
          description: string
          id: string
          ingredient_count: number
          servings: number
          title: string
          total_cost: number
        }
        Insert: {
          content?: string | null
          cook_time_minutes: number
          cost_per_portion?: number | null
          created_at?: string
          cuisine?: string | null
          description: string
          id?: string
          ingredient_count: number
          servings?: number
          title: string
          total_cost: number
        }
        Update: {
          content?: string | null
          cook_time_minutes?: number
          cost_per_portion?: number | null
          created_at?: string
          cuisine?: string | null
          description?: string
          id?: string
          ingredient_count?: number
          servings?: number
          title?: string
          total_cost?: number
        }
        Relationships: []
      }
      newsletter_drafts: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          scheduled_for: string
          sent_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_settings: {
        Row: {
          auto_send: boolean
          cron_secret: string
          id: string
          last_auto_run_at: string | null
          require_approval: boolean
          send_day: number
          send_hour: number
          send_minute: number
          timezone: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          auto_send?: boolean
          cron_secret?: string
          id?: string
          last_auto_run_at?: string | null
          require_approval?: boolean
          send_day?: number
          send_hour?: number
          send_minute?: number
          timezone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          auto_send?: boolean
          cron_secret?: string
          id?: string
          last_auto_run_at?: string | null
          require_approval?: boolean
          send_day?: number
          send_hour?: number
          send_minute?: number
          timezone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          unsubscribe_token: string
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          unsubscribe_token?: string
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          unsubscribe_token?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      saved_recipes: {
        Row: {
          budget: number | null
          content: string
          craving: string | null
          created_at: string
          cuisine: string | null
          id: string
          mode: string
          selected_days: string[] | null
          store: string | null
          title: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          content: string
          craving?: string | null
          created_at?: string
          cuisine?: string | null
          id?: string
          mode?: string
          selected_days?: string[] | null
          store?: string | null
          title: string
          user_id: string
        }
        Update: {
          budget?: number | null
          content?: string
          craving?: string | null
          created_at?: string
          cuisine?: string | null
          id?: string
          mode?: string
          selected_days?: string[] | null
          store?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      store_deals: {
        Row: {
          chain: string
          created_at: string
          deal_count: number
          deals: Json
          deals_text: string | null
          fetched_at: string
          id: string
          source: string | null
          store_id: string
          store_name: string
          week_start: string
        }
        Insert: {
          chain: string
          created_at?: string
          deal_count?: number
          deals?: Json
          deals_text?: string | null
          fetched_at?: string
          id?: string
          source?: string | null
          store_id?: string
          store_name: string
          week_start: string
        }
        Update: {
          chain?: string
          created_at?: string
          deal_count?: number
          deals?: Json
          deals_text?: string | null
          fetched_at?: string
          id?: string
          source?: string | null
          store_id?: string
          store_name?: string
          week_start?: string
        }
        Relationships: []
      }
      store_deals_settings: {
        Row: {
          active_days: number
          cron_secret: string
          enabled: boolean
          id: number
          last_run_at: string | null
          updated_at: string
        }
        Insert: {
          active_days?: number
          cron_secret?: string
          enabled?: boolean
          id?: number
          last_run_at?: string | null
          updated_at?: string
        }
        Update: {
          active_days?: number
          cron_secret?: string
          enabled?: boolean
          id?: number
          last_run_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      store_locations: {
        Row: {
          chain: string
          created_at: string
          id: string
          last_requested_at: string
          name: string
          store_id: string
          town: string | null
        }
        Insert: {
          chain: string
          created_at?: string
          id?: string
          last_requested_at?: string
          name: string
          store_id?: string
          town?: string | null
        }
        Update: {
          chain?: string
          created_at?: string
          id?: string
          last_requested_at?: string
          name?: string
          store_id?: string
          town?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
