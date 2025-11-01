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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      competition_bets: {
        Row: {
          amount: number
          bettor_id: string
          competition_id: string
          created_at: string
          id: string
          potential_payout: number
          status: string
          target_user_id: string
        }
        Insert: {
          amount: number
          bettor_id: string
          competition_id: string
          created_at?: string
          id?: string
          potential_payout: number
          status?: string
          target_user_id: string
        }
        Update: {
          amount?: number
          bettor_id?: string
          competition_id?: string
          created_at?: string
          id?: string
          potential_payout?: number
          status?: string
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_bets_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_chat: {
        Row: {
          competition_id: string
          created_at: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_chat_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_participants: {
        Row: {
          competition_id: string
          current_portfolio_value: number
          id: string
          joined_at: string
          rank: number | null
          user_id: string
          virtual_balance: number
        }
        Insert: {
          competition_id: string
          current_portfolio_value?: number
          id?: string
          joined_at?: string
          rank?: number | null
          user_id: string
          virtual_balance: number
        }
        Update: {
          competition_id?: string
          current_portfolio_value?: number
          id?: string
          joined_at?: string
          rank?: number | null
          user_id?: string
          virtual_balance?: number
        }
        Relationships: [
          {
            foreignKeyName: "competition_participants_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_trades: {
        Row: {
          competition_id: string
          created_at: string
          from_amount: number
          from_token: string
          id: string
          price: number
          to_amount: number
          to_token: string
          user_id: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          from_amount: number
          from_token: string
          id?: string
          price: number
          to_amount: number
          to_token: string
          user_id: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          from_amount?: number
          from_token?: string
          id?: string
          price?: number
          to_amount?: number
          to_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_trades_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          entry_fee: number
          id: string
          max_participants: number | null
          name: string
          start_time: string
          status: Database["public"]["Enums"]["competition_status"]
          updated_at: string
          virtual_balance: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          entry_fee?: number
          id?: string
          max_participants?: number | null
          name: string
          start_time: string
          status?: Database["public"]["Enums"]["competition_status"]
          updated_at?: string
          virtual_balance?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          entry_fee?: number
          id?: string
          max_participants?: number | null
          name?: string
          start_time?: string
          status?: Database["public"]["Enums"]["competition_status"]
          updated_at?: string
          virtual_balance?: number
        }
        Relationships: []
      }
      nft_rewards: {
        Row: {
          competition_id: string
          created_at: string
          id: string
          minted: boolean
          rank: number
          token_uri: string | null
          user_id: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          id?: string
          minted?: boolean
          rank: number
          token_uri?: string | null
          user_id: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          id?: string
          minted?: boolean
          rank?: number
          token_uri?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_rewards_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          created_at: string
          from_amount: number
          from_token: string
          id: string
          to_amount: number
          to_token: string
          transaction_signature: string | null
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string
          from_amount: number
          from_token: string
          id?: string
          to_amount: number
          to_token: string
          transaction_signature?: string | null
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string
          from_amount?: number
          from_token?: string
          id?: string
          to_amount?: number
          to_token?: string
          transaction_signature?: string | null
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      wallet_balances: {
        Row: {
          created_at: string
          id: string
          sol_balance: number
          updated_at: string
          usdt_balance: number
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          sol_balance?: number
          updated_at?: string
          usdt_balance?: number
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string
          id?: string
          sol_balance?: number
          updated_at?: string
          usdt_balance?: number
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      competition_status: "upcoming" | "active" | "completed"
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
      competition_status: ["upcoming", "active", "completed"],
    },
  },
} as const
