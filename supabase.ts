
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co'; // Remplace avec ton URL
const supabaseKey = 'public-anon-key'; // Remplace avec ta clé publique

export const supabase = createClient(supabaseUrl, supabaseKey);
