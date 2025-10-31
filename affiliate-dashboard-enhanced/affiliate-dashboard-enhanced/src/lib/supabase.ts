/*
 * Supabase Client Helpers
 *
 * This module exposes two helper functions for interacting with your Supabase
 * project. The `supabaseAdmin` client uses the service role key and should
 * only be used in server‑only code (API routes, server components) because
 * it has elevated privileges. The `supabaseAnon` client is safe to use
 * anywhere in your application; it uses the anonymous key and will respect
 * Row Level Security (RLS) policies defined in your database.
 */

'use server'
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false },
    },
  )

export const supabaseAnon = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
    },
  )