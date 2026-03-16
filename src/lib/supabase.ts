import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dpjpdxyofdjdrbayvjpv.supabase.co';
const supabaseAnonKey = 'sb_publishable_v3cLNpS8As4xelsOUVRFBg_T7VLkf6u';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
