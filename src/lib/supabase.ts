import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type for a complaint row in the database
export interface Complaint {
    id: string;
    description: string;
    dept_assigned: string;
    priority_score: number;
    status: string;
    verification_count: number;
    location: string;
    distance?: string;
    created_at: string;
    deadline?: string;
}
