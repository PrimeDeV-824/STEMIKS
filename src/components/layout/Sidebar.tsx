"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Zap, Trophy, User, Star, Menu, X, LogOut, Coins
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quiz", label: "Play Quiz", icon: Zap },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/achievements", label: "Achievements", icon: Star },
  { href: "/profile", label: "Profile", icon: User },
];

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full p-4 gap-2">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 py-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center font-black">
          S
        </div>
        <span className="font-black text-xl gradient-text">STEMiks</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium",
                active
                  ? "bg-violet-600/20 text-white border border-violet-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-5 h-5", active ? "text-violet-400" : "")} />
              {label}
              {label === "Play Quiz" && (
                <span className="ml-auto px-1.5 py-0.5 bg-violet-500/30 text-violet-300 text-xs rounded-md">
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="space-y-2 pt-2 border-t border-white/8">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {(user?.name ?? user?.email ?? "U")[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name ?? "Student"}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/8 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-[#0a1120] border-r border-white/5 z-30 flex-col">
        <NavContent />
      </div>

      {/* Mobile Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 glass rounded-xl border border-white/10 text-slate-300"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-y-0 left-0 w-72 bg-[#0a1120] z-50 md:hidden border-r border-white/5">
          <NavContent />
        </div>
      )}
    </>
  );
}
