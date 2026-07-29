import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Brand input spec: #F9FAFB fill, #D1D5DB hairline, 8px radius, no shadow.
          "flex h-11 w-full rounded-lg border border-input bg-[#F9FAFB] px-3 py-2 text-[15px] text-ink ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-mj-slate-soft/70 focus-visible:border-black focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mj-yellow/50 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
