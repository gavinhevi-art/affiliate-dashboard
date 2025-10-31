/*
 * Sidebar navigation component
 *
 * This component renders the primary navigation for the affiliate portal. It
 * displays a list of links with icons and highlights the active route. The
 * nav items are defined in an array; adjust or extend this array to add
 * additional sections to your application. Icons are pulled from the
 * `lucide-react` package, which is already a dependency of the starter.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Link as LinkIcon,
  DollarSign,
  Settings as SettingsIcon,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  Icon: React.ComponentType<any>
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/links', label: 'Links', Icon: LinkIcon },
  { href: '/payouts', label: 'Payouts', Icon: DollarSign },
  { href: '/settings', label: 'Settings', Icon: SettingsIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-2 p-4 border-r bg-white dark:bg-neutral-950 min-h-screen">
      <div className="mb-6 text-xl font-semibold">Affiliate Portal</div>
      {navItems.map(({ href, label, Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              active
                ? 'bg-neutral-200 dark:bg-neutral-800 font-medium'
                : 'hover:bg-neutral-100 dark:hover:bg-neutral-900'
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}