import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-sm bg-transparent px-3 py-2 text-sm font-body placeholder:text-muted-foreground/60 focus-visible:outline-none transition-colors border-b border-lavender/15 focus-visible:border-b-lavender/60 focus-visible:shadow-[0_1px_8px_rgba(196,181,227,0.1)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
