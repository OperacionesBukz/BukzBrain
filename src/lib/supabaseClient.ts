import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Las variables de entorno de Supabase no están configuradas')
}

// Cliente simplificado - dejar que Supabase maneje los defaults
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('✅ Supabase inicializado')
console.log('📡 URL:', supabaseUrl)