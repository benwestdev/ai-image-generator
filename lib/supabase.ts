import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL and key must be provided');
    }
    
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseInstance;
}

export const supabase = {
  get from() {
    return getSupabase().from.bind(getSupabase());
  }
};

export type SavedImage = {
  id: string;
  image_url: string;
  prompt: string;
  order_index: number;
  created_at: string;
};
