/*
 * Settings page
 *
 * This page lets an affiliate view and update basic account details such as
 * display name. Additional settings (password resets, MFA, etc.) can be
 * implemented here by integrating with Supabase Auth or your preferred auth
 * provider. The update call respects RLS rules on the `users_public` table.
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

interface Profile {
  id: string
  email: string
  display_name: string | null
  role: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const { data } = await supabase.from('users_public').select('id, email, display_name, role').single()
      if (data) {
        setProfile(data as Profile)
        setDisplayName(data.display_name || '')
      }
      setLoading(false)
    })()
  }, [])

  async function save() {
    if (!profile) return
    setSaving(true)
    await supabase
      .from('users_public')
      .update({ display_name: displayName })
      .eq('id', profile.id)
    setSaving(false)
  }

  if (loading) {
    return <p>Loading profile…</p>
  }
  if (!profile) {
    return <p>Profile not found.</p>
  }
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Account Settings</h2>
      <Card className="p-4 space-y-4 max-w-lg">
        <div className="flex flex-col">
          <label className="text-sm mb-1">Email</label>
          <input disabled className="border rounded px-3 py-2 dark:bg-neutral-800" value={profile.email} />
        </div>
        <div className="flex flex-col">
          <label className="text-sm mb-1">Display Name</label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div className="flex flex-col">
          <label className="text-sm mb-1">Role</label>
          <input disabled className="border rounded px-3 py-2 dark:bg-neutral-800 capitalize" value={profile.role} />
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </Card>
    </div>
  )
}