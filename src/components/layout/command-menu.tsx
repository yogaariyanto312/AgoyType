"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Keyboard,
  Trophy,
  User,
  Settings,
  Palette,
  Clock,
  Type,
  Quote,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useConfigStore } from "@/store/config-store";
import { THEMES } from "@/lib/themes";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const setTheme = useConfigStore((s) => s.setTheme);
  const setMode = useConfigStore((s) => s.setMode);
  const setTime = useConfigStore((s) => s.setTime);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const run = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        title="Command menu (Ctrl+K)"
        onClick={() => setOpen(true)}
      >
        <Keyboard className="h-5 w-5" />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => run(() => router.push("/"))}>
              <Keyboard /> Typing test
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push("/leaderboard"))}>
              <Trophy /> Leaderboard
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push("/account"))}>
              <User /> Account & history
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push("/settings"))}>
              <Settings /> Settings
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Mode">
            <CommandItem onSelect={() => run(() => setTime(15))}>
              <Clock /> Time 15s
            </CommandItem>
            <CommandItem onSelect={() => run(() => setTime(30))}>
              <Clock /> Time 30s
            </CommandItem>
            <CommandItem onSelect={() => run(() => setTime(60))}>
              <Clock /> Time 60s
            </CommandItem>
            <CommandItem onSelect={() => run(() => setMode("words"))}>
              <Type /> Words
            </CommandItem>
            <CommandItem onSelect={() => run(() => setMode("quote"))}>
              <Quote /> Quote
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Theme">
            {THEMES.map((t) => (
              <CommandItem key={t.id} onSelect={() => run(() => setTheme(t.id))}>
                <Palette /> {t.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
