/*
 * Button component
 *
 * A basic button with variants for different contexts (default and outline).
 * It applies Tailwind classes for padding, rounded corners and disabled state.
 */

import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline'
}

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500',
    outline: 'border border-neutral-300 text-neutral-800 bg-white hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800',
  }
  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  )
}