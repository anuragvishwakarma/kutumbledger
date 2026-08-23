import * as React from "react";

import { Slot } from "@radix-ui/react-slot";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const selectVariants = cva(
  "inline-flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:focus:outline-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      // We don't have variants for select in the original, but we can keep it extensible
    },
    defaultVariants: {},
  }
);

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof selectVariants> {
  /** Change the default rendered element for the one passed as a child, merging their props and behavior. */
  asChild?: boolean;
}

const Select = React.forwardRef<
  HTMLSelectElement,
  SelectProps
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "select";
  return (
    <Comp
      className={cn(selectVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Select.displayName = "Select";

export { Select, selectVariants };