import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wpbmlzyxahiorfjelhwc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYm1senl4YWhpb3JmamVsaHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MDIwMDksImV4cCI6MjA4NTM3ODAwOX0.qUra5sO94lfJMBNWB1I0h8uFdE13wzRZNAgEUk2FXFQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
