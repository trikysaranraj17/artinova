import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = 
  !!supabaseUrl && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  !!supabaseAnonKey && 
  supabaseAnonKey !== 'your-anon-public-key';

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-domain-artinova.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key-artinova'
);
