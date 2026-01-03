import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "gradient-primary text-primary-foreground shadow-lg hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] rounded-lg",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 rounded-lg",
        outline:
          "border-2 border-primary/20 bg-background hover:border-primary hover:bg-primary/5 text-foreground rounded-lg",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 rounded-lg",
        ghost: 
          "hover:bg-accent hover:text-accent-foreground rounded-lg",
        link: 
          "text-primary underline-offset-4 hover:underline",
        hero:
          "gradient-primary text-primary-foreground shadow-xl hover:shadow-glow hover:scale-[1.03] active:scale-[0.98] font-semibold tracking-wide rounded-xl",
        accent:
          "gradient-accent text-accent-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] font-semibold rounded-lg",
        glass:
          "bg-card/60 backdrop-blur-sm border border-border/50 text-foreground hover:bg-card/80 hover:border-primary/30 rounded-lg",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
