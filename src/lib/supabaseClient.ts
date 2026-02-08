import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Las variables de entorno de Supabase no están configuradas')
}

// Cliente con configuración específica para Realtime
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    },
    heartbeatIntervalMs: 30000,
    timeout: 30000,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.x'
    }
  }
})

console.log('✅ Supabase inicializado')
console.log('📡 URL:', supabaseUrl)