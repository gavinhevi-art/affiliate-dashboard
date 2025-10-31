/*
 * Input component
 *
 * A base input field with consistent styling. It forwards all props to the
 * underlying <input> element and merges class names.
 */

import { cn } from '@/lib/utils'

import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'border border-neutral-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700',
        className,
      )}
      {...props}
    />
  )
}