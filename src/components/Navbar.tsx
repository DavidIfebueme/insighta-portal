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
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
            Insighta Labs+
          </Link>
          <div className="flex gap-4 text-sm">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/profiles" className="text-gray-600 hover:text-gray-900">
              Profiles
            </Link>
            <Link href="/search" className="text-gray-600 hover:text-gray-900">
              Search
            </Link>
            <Link href="/account" className="text-gray-600 hover:text-gray-900">
              Account
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">@{user.username}</span>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
            {user.role}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
