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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      aeo_analyses: {
        Row: {
          article_url: string
          created_at: string
          created_by: string
          discover_checks: Json | null
          discover_ready: boolean
          faq_schema: Json | null
          id: string
          language: Database["public"]["Enums"]["indic_language"]
          overall_score: number | null
          position_zero_summary: string | null
          publication_id: string
          raw_response: Json | null
          updated_at: string
        }
        Insert: {
          article_url: string
          created_at?: string
          created_by: string
          discover_checks?: Json | null
          discover_ready?: boolean
          faq_schema?: Json | null
          id?: string
          language?: Database["public"]["Enums"]["indic_language"]
          overall_score?: number | null
          position_zero_summary?: string | null
          publication_id: string
          raw_response?: Json | null
          updated_at?: string
        }
        Update: {
          article_url?: string
          created_at?: string
          created_by?: string
          discover_checks?: Json | null
          discover_ready?: boolean
          faq_schema?: Json | null
          id?: string
          language?: Database["public"]["Enums"]["indic_language"]
          overall_score?: number | null
          position_zero_summary?: string | null
          publication_id?: string
          raw_response?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeo_analyses_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_reports: {
        Row: {
          category_counts: Json
          created_at: string
          created_by: string
          domain: string
          emotional_triggers: Json
          headlines_collected: number
          id: string
          length_buckets: Json
          publication_id: string
          sample_headlines: Json
          top_patterns: Json
        }
        Insert: {
          category_counts?: Json
          created_at?: string
          created_by: string
          domain: string
          emotional_triggers?: Json
          headlines_collected?: number
          id?: string
          length_buckets?: Json
          publication_id: string
          sample_headlines?: Json
          top_patterns?: Json
        }
        Update: {
          category_counts?: Json
          created_at?: string
          created_by?: string
          domain?: string
          emotional_triggers?: Json
          headlines_collected?: number
          id?: string
          length_buckets?: Json
          publication_id?: string
          sample_headlines?: Json
          top_patterns?: Json
        }
        Relationships: [
          {
            foreignKeyName: "competitor_reports_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      content_gap_reports: {
        Row: {
          competitor_domain: string
          competitor_topics: Json
          competitor_url_count: number
          created_at: string
          created_by: string
          id: string
          missing_topics: Json
          publication_id: string
          recommendations: Json
          summary: string | null
          under_covered_topics: Json
          user_domain: string
          user_topics: Json
          user_url_count: number
        }
        Insert: {
          competitor_domain: string
          competitor_topics?: Json
          competitor_url_count?: number
          created_at?: string
          created_by: string
          id?: string
          missing_topics?: Json
          publication_id: string
          recommendations?: Json
          summary?: string | null
          under_covered_topics?: Json
          user_domain: string
          user_topics?: Json
          user_url_count?: number
        }
        Update: {
          competitor_domain?: string
          competitor_topics?: Json
          competitor_url_count?: number
          created_at?: string
          created_by?: string
          id?: string
          missing_topics?: Json
          publication_id?: string
          recommendations?: Json
          summary?: string | null
          under_covered_topics?: Json
          user_domain?: string
          user_topics?: Json
          user_url_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_gap_reports_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      headline_tests: {
        Row: {
          article_title: string | null
          article_url: string
          created_at: string
          created_by: string
          ended_at: string | null
          id: string
          language: Database["public"]["Enums"]["indic_language"]
          notes: string | null
          publication_id: string
          section: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["test_status"]
          traffic_split: Json
          updated_at: string
          winner_variant_id: string | null
        }
        Insert: {
          article_title?: string | null
          article_url: string
          created_at?: string
          created_by: string
          ended_at?: string | null
          id?: string
          language?: Database["public"]["Enums"]["indic_language"]
          notes?: string | null
          publication_id: string
          section?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["test_status"]
          traffic_split?: Json
          updated_at?: string
          winner_variant_id?: string | null
        }
        Update: {
          article_title?: string | null
          article_url?: string
          created_at?: string
          created_by?: string
          ended_at?: string | null
          id?: string
          language?: Database["public"]["Enums"]["indic_language"]
          notes?: string | null
          publication_id?: string
          section?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["test_status"]
          traffic_split?: Json
          updated_at?: string
          winner_variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "headline_tests_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      headline_variants: {
        Row: {
          avg_dwell_time_sec: number
          clicks: number
          created_at: string
          ctr: number
          headline_text: string
          id: string
          impressions: number
          is_control: boolean
          test_id: string
          updated_at: string
          variant_label: string
        }
        Insert: {
          avg_dwell_time_sec?: number
          clicks?: number
          created_at?: string
          ctr?: number
          headline_text: string
          id?: string
          impressions?: number
          is_control?: boolean
          test_id: string
          updated_at?: string
          variant_label: string
        }
        Update: {
          avg_dwell_time_sec?: number
          clicks?: number
          created_at?: string
          ctr?: number
          headline_text?: string
          id?: string
          impressions?: number
          is_control?: boolean
          test_id?: string
          updated_at?: string
          variant_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "headline_variants_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "headline_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_blocked: boolean
          admin_notes: string | null
          api_calls_all_time: number
          api_calls_this_month: number
          api_calls_today: number
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          languages_used: string[]
          last_active_date: string | null
          manually_upgraded_by: string | null
          organisation_name: string | null
          payment_method: string | null
          payment_status: string
          phone_number: string | null
          plan_tier: string
          plan_start_date: string | null
          plan_end_date: string | null
          preferred_language: Database["public"]["Enums"]["indic_language"]
          publication_id: string | null
          referral_source: string | null
          selected_languages: Database["public"]["Enums"]["indic_language"][] | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
          user_id: string
          utr_reference: string | null
        }
        Insert: {
          account_blocked?: boolean
          admin_notes?: string | null
          api_calls_all_time?: number
          api_calls_this_month?: number
          api_calls_today?: number
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          languages_used?: string[]
          last_active_date?: string | null
          manually_upgraded_by?: string | null
          organisation_name?: string | null
          payment_method?: string | null
          payment_status?: string
          phone_number?: string | null
          plan_tier?: string
          plan_start_date?: string | null
          plan_end_date?: string | null
          preferred_language?: Database["public"]["Enums"]["indic_language"]
          publication_id?: string | null
          referral_source?: string | null
          selected_languages?: Database["public"]["Enums"]["indic_language"][] | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id: string
          utr_reference?: string | null
        }
        Update: {
          account_blocked?: boolean
          admin_notes?: string | null
          api_calls_all_time?: number
          api_calls_this_month?: number
          api_calls_today?: number
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          languages_used?: string[]
          last_active_date?: string | null
          manually_upgraded_by?: string | null
          organisation_name?: string | null
          payment_method?: string | null
          payment_status?: string
          phone_number?: string | null
          plan_tier?: string
          plan_start_date?: string | null
          plan_end_date?: string | null
          preferred_language?: Database["public"]["Enums"]["indic_language"]
          publication_id?: string | null
          referral_source?: string | null
          selected_languages?: Database["public"]["Enums"]["indic_language"][] | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string
          utr_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          created_at: string
          default_language: Database["public"]["Enums"]["indic_language"]
          domain: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_language?: Database["public"]["Enums"]["indic_language"]
          domain?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_language?: Database["public"]["Enums"]["indic_language"]
          domain?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          preferred_language:
            | Database["public"]["Enums"]["indic_language"]
            | null
          publication: string | null
          role: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          preferred_language?:
            | Database["public"]["Enums"]["indic_language"]
            | null
          publication?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          preferred_language?:
            | Database["public"]["Enums"]["indic_language"]
            | null
          publication?: string | null
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_list_users: {
        Args: never
        Returns: {
          account_blocked: boolean
          admin_notes: string
          api_calls_all_time: number
          api_calls_this_month: number
          api_calls_today: number
          created_at: string
          display_name: string
          email: string
          last_active_date: string
          manually_upgraded_by: string
          organisation_name: string
          payment_method: string
          payment_status: string
          phone_number: string
          preferred_language: string
          selected_languages: string[] | null
          plan_tier: string
          plan_start_date: string | null
          plan_end_date: string | null
          referral_source: string
          trial_end_date: string
          trial_start_date: string
          user_id: string
          utr_reference: string
        }[]
      }
      admin_summary_metrics: { Args: never; Returns: Json }
      admin_update_user: {
        Args: {
          _account_blocked?: boolean
          _admin_notes?: string
          _payment_method?: string
          _payment_status?: string
          _plan_tier?: string
          _selected_languages?: string[]
          _trial_start_date?: string
          _trial_end_date?: string
          _plan_start_date?: string
          _plan_end_date?: string
          _user_id: string
          _utr_reference?: string
        }
        Returns: {
          account_blocked: boolean
          admin_notes: string | null
          api_calls_all_time: number
          api_calls_this_month: number
          api_calls_today: number
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          languages_used: string[]
          last_active_date: string | null
          manually_upgraded_by: string | null
          organisation_name: string | null
          payment_method: string | null
          payment_status: string
          phone_number: string | null
          plan_tier: string
          plan_start_date: string | null
          plan_end_date: string | null
          preferred_language: Database["public"]["Enums"]["indic_language"]
          publication_id: string | null
          referral_source: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
          user_id: string
          utr_reference: string | null
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_user_publication: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      record_api_call: {
        Args: { _lang?: string }
        Returns: {
          account_blocked: boolean
          admin_notes: string | null
          api_calls_all_time: number
          api_calls_this_month: number
          api_calls_today: number
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          languages_used: string[]
          last_active_date: string | null
          manually_upgraded_by: string | null
          organisation_name: string | null
          payment_method: string | null
          payment_status: string
          phone_number: string | null
          plan_tier: string
          plan_start_date: string | null
          plan_end_date: string | null
          preferred_language: Database["public"]["Enums"]["indic_language"]
          publication_id: string | null
          referral_source: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
          user_id: string
          utr_reference: string | null
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer"
      indic_language:
        | "hi"
        | "bn"
        | "ta"
        | "te"
        | "mr"
        | "gu"
        | "kn"
        | "ml"
        | "pa"
        | "en"
      test_status: "draft" | "running" | "completed" | "archived"
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
      app_role: ["admin", "editor", "viewer"],
      indic_language: [
        "hi",
        "bn",
        "ta",
        "te",
        "mr",
        "gu",
        "kn",
        "ml",
        "pa",
        "en",
      ],
      test_status: ["draft", "running", "completed", "archived"],
    },
  },
} as const
