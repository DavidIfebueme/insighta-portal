"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { logout as apiLogout } from "@/lib/api";

export function Navbar() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    try {
      await apiLogout();
    } catch {}
    setUser(null);
    router.push("/login");
  }

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-xl font-medium tracking-tight text-zinc-900">
            Insighta Labs+
          </Link>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/profiles" className="text-zinc-500 hover:text-zinc-900 transition-colors">
              Profiles
            </Link>
            <Link href="/search" className="text-zinc-500 hover:text-zinc-900 transition-colors">
              Search
            </Link>
            <Link href="/account" className="text-zinc-500 hover:text-zinc-900 transition-colors">
              Account
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-700">@{user.username}</span>
          <span className="text-xs font-semibold bg-zinc-100 text-zinc-800 px-2 py-1 rounded-md uppercase tracking-wider">
            {user.role}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
