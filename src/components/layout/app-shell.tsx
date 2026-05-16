"use client";

import { FileText, Map as MapIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

const navItems: {
  href: string;
  label: string;
  icon: LucideIcon;
}[] = [
  {
    href: "/map",
    label: "Map",
    icon: MapIcon,
  },
  {
    href: "/docs",
    label: "Docs",
    icon: FileText,
  },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <main className="flex h-screen overflow-hidden bg-slate-950 text-slate-950">
      <nav className="flex w-16 shrink-0 flex-col items-center border-r border-slate-200 bg-slate-50 py-4">
        <div className="flex flex-1 flex-col gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`grid h-10 w-10 place-items-center rounded-md border text-xs font-semibold transition ${
                  isActive
                    ? "border-lime-600 bg-white text-lime-700 shadow-sm"
                    : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-white"
                }`}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon aria-hidden="true" className="h-5 w-5" />
              </Link>
            );
          })}
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-600">
          RG
        </div>
      </nav>

      {children}
    </main>
  );
}
