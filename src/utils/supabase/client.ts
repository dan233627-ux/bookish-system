import { createClient } from '@supabase/supabase-js';

const meta = import.meta as any;
const supabaseUrl = meta.env?.VITE_SUPABASE_URL || meta.env?.NEXT_PUBLIC_SUPABASE_URL || 'https://wvgpbbcvdyotritlmksi.supabase.co';
const supabaseKey = meta.env?.VITE_SUPABASE_ANON_KEY || meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_5n30Xe14Yav5OUqt_8HpvA_ZGdvMjiW';

export const supabase = createClient(supabaseUrl, supabaseKey);
