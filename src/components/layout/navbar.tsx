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
    <header className="w-full">
      <nav className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-tt-main text-background">
              <Keyboard className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Type<span className="text-tt-main">Flow</span>
            </span>
          </Link>
          <div className="hidden items-center gap-1 sm:flex">
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
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "text-tt-main"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <CommandMenu />
          <ThemeSwitcher />
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
