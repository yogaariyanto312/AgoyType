"use client";

import { useEffect } from "react";
import { useConfigStore } from "@/store/config-store";
import { getTheme, themeToCssVars } from "@/lib/themes";

/**
 * Applies the active theme's CSS custom properties to <html> whenever the
 * selected theme changes. Renders nothing.
 */
export function ThemeManager() {
  const themeId = useConfigStore((s) => s.themeId);

  useEffect(() => {
    const theme = getTheme(themeId);
    const root = document.documentElement;
    const vars = themeToCssVars(theme);
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
    root.classList.toggle("dark", theme.isDark);
    root.style.colorScheme = theme.isDark ? "dark" : "light";
  }, [themeId]);

  return null;
}
