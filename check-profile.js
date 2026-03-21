
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProfile() {
    const { data: users, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        // Fallback: search by email manually if possible? No, we need the ID.
        // Let's just try to select all profiles.
        const { data: profiles, error: profileError } = await supabase.from('profiles').select('*');
        console.log("Profiles:", JSON.stringify(profiles, null, 2));
    } else {
        console.log("Users:", JSON.stringify(users, null, 2));
    }
}

checkProfile();
