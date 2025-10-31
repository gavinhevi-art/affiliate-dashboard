import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function getClientHints(req: NextRequest) {
  const ua = req.headers.get('user-agent') || ''
  const ref = req.headers.get('referer') || ''
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || (req as any).ip || ''
  return { ua, ref, ip }
}

function parseQuery(u: URL) {
  const get = (k: string) => u.searchParams.get(k) || undefined
  return {
    utm_source: get('utm_source'),
    utm_medium: get('utm_medium'),
    utm_campaign: get('utm_campaign'),
    utm_term: get('utm_term'),
    utm_content: get('utm_content'),
    subid: get('subid'),
  }
}

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const admin = supabaseAdmin()
  const { code } = params
  const url = new URL(req.url)
  const hints = getClientHints(req)
  const utm = parseQuery(url)

  // find link by short_code
  const { data: link, error } = await admin
    .from('links')
    .select('id, offer:offers(destination_url)')
    .eq('short_code', code)
    .eq('offer.active', true)
    .single()

  if (error || !link) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 })
  }

  // session cookie
  const cookieName = 'af_sess'
  let sessionId = req.cookies.get(cookieName)?.value
  if (!sessionId) {
    sessionId = crypto.randomUUID()
  }

  // naive device parsing
  const device = /mobile/i.test(hints.ua) ? 'mobile' : 'desktop'

  await admin.from('clicks').insert({
    link_id: link.id,
    ip: hints.ip,
    user_agent: hints.ua,
    referer: hints.ref,
    session_id: sessionId,
    device,
    ...utm,
  })

  const res = NextResponse.redirect(link.offer.destination_url, 302)
  res.cookies.set(cookieName, sessionId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 90,
  })
  return res
}