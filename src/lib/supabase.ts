import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://upffzxdzpwgxparmdgfz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZmZ6eGR6cHdneHBhcm1kZ2Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTI4MjgsImV4cCI6MjA2ODI4ODgyOH0.FXFvQp3jIK9fqsi-MUTOeGCF4Zo6F6N-fVkWs2RBemI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          age: number | null
          location: string | null
          food_preferences: string[] | null
          dietary_restrictions: string[] | null
          favorite_cuisines: string[] | null
          dining_style: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          age?: number | null
          location?: string | null
          food_preferences?: string[] | null
          dietary_restrictions?: string[] | null
          favorite_cuisines?: string[] | null
          dining_style?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          age?: number | null
          location?: string | null
          food_preferences?: string[] | null
          dietary_restrictions?: string[] | null
          favorite_cuisines?: string[] | null
          dining_style?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          status: 'pending' | 'matched' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          status?: 'pending' | 'matched' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          status?: 'pending' | 'matched' | 'rejected'
          created_at?: string
        }
      }
      swipes: {
        Row: {
          id: string
          swiper_id: string
          swiped_id: string
          liked: boolean
          created_at: string
        }
        Insert: {
          id?: string
          swiper_id: string
          swiped_id: string
          liked: boolean
          created_at?: string
        }
        Update: {
          id?: string
          swiper_id?: string
          swiped_id?: string
          liked?: boolean
          created_at?: string
        }
      }
    }
  }
}