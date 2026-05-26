import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iuyrwibrvyzvdexurgde.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_6Xv7XHWjAzriG1IXFDMvWQ_Qm95PvYc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
