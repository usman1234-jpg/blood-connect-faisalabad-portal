export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blood_requests: {
        Row: {
          blood_group: string
          city: string
          contact_number: string
          created_at: string
          created_by: string | null
          description: string | null
          hospital_name: string
          id: string
          needed_by: string
          patient_name: string
          status: string
          units_needed: number
          updated_at: string
          urgency_level: string
        }
        Insert: {
          blood_group: string
          city: string
          contact_number: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          hospital_name: string
          id?: string
          needed_by: string
          patient_name: string
          status?: string
          units_needed?: number
          updated_at?: string
          urgency_level?: string
        }
        Update: {
          blood_group?: string
          city?: string
          contact_number?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          hospital_name?: string
          id?: string
          needed_by?: string
          patient_name?: string
          status?: string
          units_needed?: number
          updated_at?: string
          urgency_level?: string
        }
        Relationships: []
      }
      donation_history: {
        Row: {
          created_at: string
          donation_date: string
          donor_id: string
          id: string
          location: string
          notes: string | null
          recorded_by: string | null
          units_donated: number
        }
        Insert: {
          created_at?: string
          donation_date: string
          donor_id: string
          id?: string
          location: string
          notes?: string | null
          recorded_by?: string | null
          units_donated?: number
        }
        Update: {
          created_at?: string
          donation_date?: string
          donor_id?: string
          id?: string
          location?: string
          notes?: string | null
          recorded_by?: string | null
          units_donated?: number
        }
        Relationships: [
          {
            foreignKeyName: "donation_history_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          blood_group: string
          city: string
          contact: string
          created_at: string
          date_added: string
          department: string
          gender: string
          id: string
          is_hostel_resident: boolean
          last_donation_date: string | null
          name: string
          next_donation_date: string | null
          semester: string
          semester_end_date: string | null
          university: string
          updated_at: string
        }
        Insert: {
          blood_group: string
          city: string
          contact: string
          created_at?: string
          date_added?: string
          department: string
          gender: string
          id?: string
          is_hostel_resident?: boolean
          last_donation_date?: string | null
          name: string
          next_donation_date?: string | null
          semester: string
          semester_end_date?: string | null
          university: string
          updated_at?: string
        }
        Update: {
          blood_group?: string
          city?: string
          contact?: string
          created_at?: string
          date_added?: string
          department?: string
          gender?: string
          id?: string
          is_hostel_resident?: boolean
          last_donation_date?: string | null
          name?: string
          next_donation_date?: string | null
          semester?: string
          semester_end_date?: string | null
          university?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          added_by: string | null
          created_at: string
          date_added: string
          full_name: string | null
          id: string
          note: string | null
          role: string
          university: string | null
          updated_at: string
          username: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          date_added?: string
          full_name?: string | null
          id: string
          note?: string | null
          role?: string
          university?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          date_added?: string
          full_name?: string | null
          id?: string
          note?: string | null
          role?: string
          university?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      universities: {
        Row: {
          added_by: string | null
          city: string | null
          contact_info: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          added_by?: string | null
          city?: string | null
          contact_info?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          added_by?: string | null
          city?: string | null
          contact_info?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
