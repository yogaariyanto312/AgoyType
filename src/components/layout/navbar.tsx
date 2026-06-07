"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Keyboard, Trophy, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./theme-switcher";
import { CommandMenu } from "./command-menu";
import { UserMenu } from "./user-menu";

const links = [
  { href: "/", label: "Test", icon: Keyboard },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/about", label: "About", icon: Info },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-foreground/[0.06] bg-background/80 backdrop-blur-2xl">
      <nav className="container flex h-14 items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-tt-main/20 text-tt-main ring-1 ring-tt-main/30">
            <Keyboard className="h-4 w-4" />
          </span>
          <span className="font-bold tracking-tight">
            Agoy<span className="text-tt-main">Type</span>
          </span>
        </Link>

        {/* Center pill navigation — distinctly non-Monkeytype */}
        <div className="hidden items-center rounded-full border border-foreground/[0.08] bg-foreground/[0.04] p-1 sm:flex">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150",
                  active
                    ? "bg-background/80 text-tt-main shadow-sm ring-1 ring-foreground/[0.08]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-1">
          <CommandMenu />
          <ThemeSwitcher />
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
