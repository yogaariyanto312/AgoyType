/**
 * Theme presets. Each theme is a flat map of HSL triples (space separated, e.g.
 * "240 10% 4%") that are written to CSS custom properties on <html>. Components
 * read them through Tailwind tokens such as `bg-background` / `text-tt-main`.
 */

export interface Theme {
  id: string;
  name: string;
  isDark: boolean;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
    // typing-test specific
    ttMain: string; // active / brand color (caret, highlights)
    ttSub: string; // untyped text
    ttText: string; // typed-correct text
    ttError: string; // typed-wrong text
    ttErrorExtra: string; // extra characters
    ttCaret: string; // caret color
  };
}

export const THEMES: Theme[] = [
  {
    id: "carbon",
    name: "Carbon",
    isDark: true,
    colors: {
      background: "0 0% 7%",
      foreground: "0 0% 90%",
      card: "0 0% 10%",
      cardForeground: "0 0% 90%",
      popover: "0 0% 9%",
      popoverForeground: "0 0% 90%",
      primary: "32 95% 55%",
      primaryForeground: "0 0% 7%",
      secondary: "0 0% 15%",
      secondaryForeground: "0 0% 90%",
      muted: "0 0% 15%",
      mutedForeground: "0 0% 55%",
      accent: "0 0% 16%",
      accentForeground: "0 0% 90%",
      destructive: "0 72% 51%",
      destructiveForeground: "0 0% 98%",
      border: "0 0% 18%",
      input: "0 0% 18%",
      ring: "32 95% 55%",
      ttMain: "32 95% 55%",
      ttSub: "0 0% 35%",
      ttText: "0 0% 92%",
      ttError: "0 72% 58%",
      ttErrorExtra: "0 50% 40%",
      ttCaret: "32 95% 55%",
    },
  },
  {
    id: "serika",
    name: "Serika Dark",
    isDark: true,
    colors: {
      background: "60 3% 13%",
      foreground: "45 23% 78%",
      card: "60 3% 16%",
      cardForeground: "45 23% 78%",
      popover: "60 3% 15%",
      popoverForeground: "45 23% 78%",
      primary: "45 86% 58%",
      primaryForeground: "60 3% 13%",
      secondary: "60 3% 20%",
      secondaryForeground: "45 23% 78%",
      muted: "60 3% 20%",
      mutedForeground: "45 8% 50%",
      accent: "60 3% 22%",
      accentForeground: "45 23% 78%",
      destructive: "5 75% 55%",
      destructiveForeground: "0 0% 98%",
      border: "60 3% 24%",
      input: "60 3% 24%",
      ring: "45 86% 58%",
      ttMain: "45 86% 58%",
      ttSub: "55 5% 40%",
      ttText: "45 30% 85%",
      ttError: "5 75% 60%",
      ttErrorExtra: "5 45% 42%",
      ttCaret: "45 86% 58%",
    },
  },
  {
    id: "dracula",
    name: "Dracula",
    isDark: true,
    colors: {
      background: "231 15% 18%",
      foreground: "60 30% 96%",
      card: "232 14% 22%",
      cardForeground: "60 30% 96%",
      popover: "232 14% 20%",
      popoverForeground: "60 30% 96%",
      primary: "265 89% 78%",
      primaryForeground: "231 15% 18%",
      secondary: "232 14% 26%",
      secondaryForeground: "60 30% 96%",
      muted: "232 14% 26%",
      mutedForeground: "225 15% 60%",
      accent: "326 100% 74%",
      accentForeground: "231 15% 18%",
      destructive: "0 100% 67%",
      destructiveForeground: "0 0% 98%",
      border: "232 14% 31%",
      input: "232 14% 31%",
      ring: "265 89% 78%",
      ttMain: "135 94% 65%",
      ttSub: "225 15% 48%",
      ttText: "60 30% 96%",
      ttError: "0 100% 67%",
      ttErrorExtra: "0 60% 45%",
      ttCaret: "265 89% 78%",
    },
  },
  {
    id: "nord",
    name: "Nord",
    isDark: true,
    colors: {
      background: "220 16% 22%",
      foreground: "218 27% 88%",
      card: "222 16% 25%",
      cardForeground: "218 27% 88%",
      popover: "222 16% 24%",
      popoverForeground: "218 27% 88%",
      primary: "193 43% 67%",
      primaryForeground: "220 16% 22%",
      secondary: "220 17% 30%",
      secondaryForeground: "218 27% 88%",
      muted: "220 17% 30%",
      mutedForeground: "219 14% 62%",
      accent: "210 34% 63%",
      accentForeground: "220 16% 22%",
      destructive: "354 42% 56%",
      destructiveForeground: "0 0% 98%",
      border: "220 17% 34%",
      input: "220 17% 34%",
      ring: "193 43% 67%",
      ttMain: "179 25% 65%",
      ttSub: "220 12% 50%",
      ttText: "218 27% 92%",
      ttError: "354 42% 60%",
      ttErrorExtra: "354 30% 42%",
      ttCaret: "193 43% 67%",
    },
  },
  {
    id: "rosepine",
    name: "Rosé Pine",
    isDark: true,
    colors: {
      background: "249 22% 12%",
      foreground: "245 50% 91%",
      card: "247 23% 15%",
      cardForeground: "245 50% 91%",
      popover: "247 23% 14%",
      popoverForeground: "245 50% 91%",
      primary: "2 55% 83%",
      primaryForeground: "249 22% 12%",
      secondary: "248 24% 20%",
      secondaryForeground: "245 50% 91%",
      muted: "248 24% 20%",
      mutedForeground: "245 13% 60%",
      accent: "189 43% 73%",
      accentForeground: "249 22% 12%",
      destructive: "343 76% 68%",
      destructiveForeground: "0 0% 98%",
      border: "248 24% 24%",
      input: "248 24% 24%",
      ring: "2 55% 83%",
      ttMain: "2 66% 75%",
      ttSub: "245 13% 45%",
      ttText: "245 50% 91%",
      ttError: "343 76% 68%",
      ttErrorExtra: "343 40% 45%",
      ttCaret: "189 43% 73%",
    },
  },
  {
    id: "matrix",
    name: "Matrix",
    isDark: true,
    colors: {
      background: "120 30% 4%",
      foreground: "120 90% 70%",
      card: "120 25% 7%",
      cardForeground: "120 90% 70%",
      popover: "120 25% 6%",
      popoverForeground: "120 90% 70%",
      primary: "120 100% 50%",
      primaryForeground: "120 30% 4%",
      secondary: "120 20% 12%",
      secondaryForeground: "120 90% 70%",
      muted: "120 20% 12%",
      mutedForeground: "120 30% 45%",
      accent: "120 20% 14%",
      accentForeground: "120 90% 70%",
      destructive: "0 90% 55%",
      destructiveForeground: "0 0% 98%",
      border: "120 25% 16%",
      input: "120 25% 16%",
      ring: "120 100% 50%",
      ttMain: "120 100% 50%",
      ttSub: "120 25% 30%",
      ttText: "120 90% 72%",
      ttError: "0 90% 60%",
      ttErrorExtra: "0 50% 40%",
      ttCaret: "120 100% 50%",
    },
  },
  {
    id: "light",
    name: "Light",
    isDark: false,
    colors: {
      background: "0 0% 100%",
      foreground: "240 10% 12%",
      card: "0 0% 99%",
      cardForeground: "240 10% 12%",
      popover: "0 0% 100%",
      popoverForeground: "240 10% 12%",
      primary: "32 95% 48%",
      primaryForeground: "0 0% 100%",
      secondary: "240 5% 96%",
      secondaryForeground: "240 10% 12%",
      muted: "240 5% 96%",
      mutedForeground: "240 4% 46%",
      accent: "240 5% 92%",
      accentForeground: "240 10% 12%",
      destructive: "0 72% 51%",
      destructiveForeground: "0 0% 100%",
      border: "240 6% 88%",
      input: "240 6% 88%",
      ring: "32 95% 48%",
      ttMain: "32 95% 45%",
      ttSub: "240 5% 70%",
      ttText: "240 10% 15%",
      ttError: "0 72% 51%",
      ttErrorExtra: "0 60% 70%",
      ttCaret: "32 95% 45%",
    },
  },
  {
    id: "paper",
    name: "Paper",
    isDark: false,
    colors: {
      background: "40 30% 96%",
      foreground: "30 15% 18%",
      card: "40 30% 99%",
      cardForeground: "30 15% 18%",
      popover: "40 30% 99%",
      popoverForeground: "30 15% 18%",
      primary: "20 80% 45%",
      primaryForeground: "40 30% 98%",
      secondary: "40 20% 90%",
      secondaryForeground: "30 15% 18%",
      muted: "40 20% 90%",
      mutedForeground: "30 10% 45%",
      accent: "40 20% 86%",
      accentForeground: "30 15% 18%",
      destructive: "0 65% 48%",
      destructiveForeground: "40 30% 98%",
      border: "40 15% 82%",
      input: "40 15% 82%",
      ring: "20 80% 45%",
      ttMain: "20 80% 42%",
      ttSub: "30 10% 62%",
      ttText: "30 15% 20%",
      ttError: "0 65% 48%",
      ttErrorExtra: "0 50% 68%",
      ttCaret: "20 80% 42%",
    },
  },
];

export const DEFAULT_THEME_ID = "carbon";

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** Convert a theme into the CSS custom-property record applied to <html>. */
export function themeToCssVars(theme: Theme): Record<string, string> {
  const c = theme.colors;
  return {
    "--background": c.background,
    "--foreground": c.foreground,
    "--card": c.card,
    "--card-foreground": c.cardForeground,
    "--popover": c.popover,
    "--popover-foreground": c.popoverForeground,
    "--primary": c.primary,
    "--primary-foreground": c.primaryForeground,
    "--secondary": c.secondary,
    "--secondary-foreground": c.secondaryForeground,
    "--muted": c.muted,
    "--muted-foreground": c.mutedForeground,
    "--accent": c.accent,
    "--accent-foreground": c.accentForeground,
    "--destructive": c.destructive,
    "--destructive-foreground": c.destructiveForeground,
    "--border": c.border,
    "--input": c.input,
    "--ring": c.ring,
    "--tt-main": c.ttMain,
    "--tt-sub": c.ttSub,
    "--tt-text": c.ttText,
    "--tt-error": c.ttError,
    "--tt-error-extra": c.ttErrorExtra,
    "--tt-caret": c.ttCaret,
  };
}
