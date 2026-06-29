import { createClient } from "@supabase/supabase-js"

const supabaseURL = import.meta.env.VITE_SUPABASE_URL
const supabasekey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseURL, supabasekey)