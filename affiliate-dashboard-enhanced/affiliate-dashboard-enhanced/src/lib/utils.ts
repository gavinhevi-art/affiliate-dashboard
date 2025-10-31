/**
 * Utility functions
 *
 * This file contains helper functions that are reused throughout the
 * application. The `cn` function merges tailwind class names. If a
 * falsy value (undefined, null, false) is passed, it will be skipped.
 */

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}