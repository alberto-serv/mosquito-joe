import * as React from 'react'

import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // Matches the Input primitive: #F9FAFB fill, #D1D5DB hairline, 8px radius.
        'flex min-h-[88px] w-full rounded-lg border border-input bg-[#F9FAFB] px-3 py-2.5 text-[15px] text-ink ring-offset-background transition-colors placeholder:text-mj-slate-soft/70 focus-visible:border-black focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mj-yellow/50 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
