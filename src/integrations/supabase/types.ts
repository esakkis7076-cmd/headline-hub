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
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          preferred_language: Database["public"]["Enums"]["indic_language"]
          publication_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          preferred_language?: Database["public"]["Enums"]["indic_language"]
          publication_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          preferred_language?: Database["public"]["Enums"]["indic_language"]
          publication_id?: string | null
          updated_at?: string
          user_id?: string
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
      current_user_publication: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
