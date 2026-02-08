import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Las variables de entorno de Supabase no están configuradas')
}

// Forzar WebSocket a usar vsn 1.0.0
const OriginalWebSocket = window.WebSocket;
window.WebSocket = function(url: string | URL, protocols?: string | string[]) {
  let modifiedUrl = url.toString();
  if (modifiedUrl.includes('supabase') && modifiedUrl.includes('realtime')) {
    modifiedUrl = modifiedUrl.replace('vsn=2.0.0', 'vsn=1.0.0');
    console.log('🔧 WebSocket URL modificada a vsn=1.0.0');
  }
  return new OriginalWebSocket(modifiedUrl, protocols);
} as any;

// Cliente normal
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('✅ Supabase inicializado con WebSocket interceptor')