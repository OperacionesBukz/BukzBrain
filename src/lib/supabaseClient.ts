import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/[\r\n\s]/g, '')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Las variables de entorno de Supabase no están configuradas')
}

console.log('🔑 Key length:', supabaseAnonKey.length)
console.log('🔑 Key ends with:', supabaseAnonKey.slice(-10))

// Cliente normal con key limpia
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('✅ Supabase inicializado')