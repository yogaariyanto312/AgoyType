"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeManager } from "@/components/theme-manager";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeManager />
      <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      <Toaster
        position="bottom-center"
        toastOptions={{
          classNames: {
            toast:
              "bg-popover text-popover-foreground border border-border rounded-md",
          },
        }}
      />
    </SessionProvider>
  );
}
