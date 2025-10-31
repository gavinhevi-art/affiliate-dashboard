/*
 * Card component
 *
 * A simple wrapper that applies consistent styling for cards throughout the
 * application. It accepts arbitrary children and forwards additional
 * props to the underlying div.
 */

import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-neutral-200 bg-white dark:bg-neutral-900 shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}