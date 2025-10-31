/*
 * Links management page
 *
 * This page lists your affiliate links along with basic performance metrics. You
 * can create new links tied to specific offers, search existing links by
 * name or offer, and copy short URLs directly to the clipboard. Metric
 * columns are loaded from the `v_affiliate_totals` view. Use this page to
 * organize and share tracking links efficiently.
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { nanoid } from 'nanoid'
import { Copy } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

interface Offer {
  id: string
  name: string
  slug: string
}

interface LinkRow {
  id: string
  short_code: string
  name: string | null
  offer: Offer | null
  clicks?: number
  conversions?: number
  revenue_cents?: number
}

export default function LinksPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [links, setLinks] = useState<LinkRow[]>([])
  const [name, setName] = useState('')
  const [offerId, setOfferId] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      // load active offers
      const { data: o } = await supabase.from('offers').select('id, name, slug').eq('active', true)
      setOffers(o || [])
      // load links
      await refreshLinks()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function refreshLinks() {
    const { data: l } = await supabase.from('links').select('id, short_code, name, offer:offers(id, name, slug)')
    const base = (l || []) as LinkRow[]
    // fetch metrics grouped by link
    const { data: m } = await supabase.from('v_affiliate_totals').select(
      'link_id, clicks, conversions, revenue_cents',
    )
    const metrics = (m || []) as { link_id: string; clicks: number; conversions: number; revenue_cents: number }[]
    const combined = base.map((link) => {
      const stat = metrics.find((k) => k.link_id === link.id)
      return {
        ...link,
        clicks: stat?.clicks || 0,
        conversions: stat?.conversions || 0,
        revenue_cents: stat?.revenue_cents || 0,
      }
    })
    setLinks(combined)
  }

  async function createLink() {
    if (!offerId) return
    setLoading(true)
    const short_code = nanoid(6)
    const { data: me } = await supabase.from('users_public').select('id').single()
    if (!me) {
      setLoading(false)
      return
    }
    const { data: aff } = await supabase.from('affiliates').select('id').eq('user_id', me.id).single()
    if (!aff) {
      setLoading(false)
      return
    }
    await supabase.from('links').insert({
      affiliate_id: aff.id,
      offer_id: offerId,
      short_code,
      name: name || null,
    })
    setName('')
    setOfferId('')
    await refreshLinks()
    setLoading(false)
  }

  const filtered = links.filter((l) => {
    const term = search.toLowerCase()
    return (
      l.short_code.toLowerCase().includes(term) ||
      (l.name || '').toLowerCase().includes(term) ||
      (l.offer?.name || '').toLowerCase().includes(term)
    )
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Your Links</h2>
      {/* Create new link */}
      <Card className="p-4 space-y-3">
          <div className="grid gap-2 md:grid-cols-3">
            <div className="flex flex-col">
              <label className="text-sm mb-1">Link name (optional)</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. IG Story #1" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1">Offer</label>
              <select
                className="border rounded px-3 py-2 dark:bg-neutral-800"
                value={offerId}
                onChange={(e) => setOfferId(e.target.value)}
              >
                <option value="">Select an offer</option>
                {offers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={createLink} disabled={loading || !offerId}>
                Create Link
              </Button>
            </div>
          </div>
      </Card>
      {/* Search */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by name, offer or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {/* List */}
      {filtered.length === 0 ? (
        <p>No links found.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((l) => (
            <Card key={l.id} className="p-4 space-y-2">
              <div className="font-medium flex justify-between items-center">
                <span>{l.name || '(no name)'} • {l.offer?.name}</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {l.clicks} clicks, {l.conversions} conv, ${((l.revenue_cents || 0) / 100).toFixed(2)}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <code className="block text-sm break-all">{`${appUrl}/api/r/${l.short_code}`}</code>
                  <button
                    className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => copy(`${appUrl}/api/r/${l.short_code}`)}
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {l.offer?.slug && (
                  <div className="flex items-center gap-2">
                    <code className="block text-sm break-all">{`${appUrl}/api/go/<AFFILIATE_CODE>/${l.offer.slug}`}</code>
                    <button
                      className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      onClick={() => copy(`${appUrl}/api/go/<AFFILIATE_CODE>/${l.offer!.slug}`)}
                      title="Copy Vanity URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}