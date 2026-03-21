
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearProfiles() {
    const { data, error } = await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.error("Error clearing profiles:", error);
    else console.log("Profiles cleared successfully.");
}

clearProfiles();
