"use client";

import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/hooks/use-theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
