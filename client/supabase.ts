import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co'; // Remplacer par ton URL Supabase
const supabaseKey = 'public-anon-key'; // Remplacer par ta clé publique

export const supabase = createClient(supabaseUrl, supabaseKey);