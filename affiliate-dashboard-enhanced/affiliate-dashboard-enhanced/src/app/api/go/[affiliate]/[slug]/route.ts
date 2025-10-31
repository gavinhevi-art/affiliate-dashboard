import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { GET as redirectGet } from '@/app/api/r/[code]/route'

export async function GET(
  req: NextRequest,
  { params }: { params: { affiliate: string; slug: string } },
) {
  const admin = supabaseAdmin()
  const { affiliate, slug } = params

  const { data: rec, error } = await admin
    .from('links')
    .select('short_code, affiliate:affiliates(code), offer:offers(slug, active)')
    .eq('affiliate.code', affiliate)
    .eq('offer.slug', slug)
    .single()

  if (error || !rec || !rec.offer?.active) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // delegate to /r/:code for unified logging
  const u = new URL(req.url)
  u.pathname = `/api/r/${rec.short_code}`
  return redirectGet(new NextRequest(u.toString(), { headers: req.headers }), { params: { code: rec.short_code } })
}