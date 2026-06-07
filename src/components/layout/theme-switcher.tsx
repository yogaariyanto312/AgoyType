"use client";

import { Palette, Check } from "lucide-react";
import { useConfigStore } from "@/store/config-store";
import { THEMES } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const themeId = useConfigStore((s) => s.themeId);
  const setTheme = useConfigStore((s) => s.setTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Theme">
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              <span
                className="h-4 w-4 rounded-full border"
                style={{
                  background: `hsl(${theme.colors.background})`,
                  borderColor: `hsl(${theme.colors.ttMain})`,
                }}
              >
                <span
                  className="block h-full w-full scale-50 rounded-full"
                  style={{ background: `hsl(${theme.colors.ttMain})` }}
                />
              </span>
              {theme.name}
            </span>
            {themeId === theme.id && <Check className={cn("h-4 w-4")} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
