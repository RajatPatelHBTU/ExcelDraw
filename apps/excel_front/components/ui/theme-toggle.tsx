"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * Floating light/dark switch. Renders a stable placeholder until mounted so the
 * server and first client paint match (the real icon depends on `document`).
 * Hidden on the landing page, which is intentionally always neon-dark.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useThemeStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (pathname === "/") return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle color theme"
      title={isDark ? "Switch to light" : "Switch to dark"}
      className={cn(
        "fixed right-5 top-5 z-[60] flex h-10 w-10 items-center justify-center rounded-full",
        "border border-border bg-card/70 text-foreground shadow-lg backdrop-blur-md",
        "transition-all hover:scale-105 hover:border-primary/60 hover:shadow-primary/20",
        className
      )}
    >
      {mounted ? (
        isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
      ) : (
        <span className="h-5 w-5" />
      )}
    </button>
  );
}
