"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { listProfiles } from "@/lib/api";

interface Profile {
  id: string;
  name: string;
  gender: string;
  age: number;
  country_name: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [recent, setRecent] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      const data = await listProfiles({ limit: "5", order: "desc" });
      setRecent(data.data);
      setTotal(data.total);
    } catch {
      console.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) loadDashboard();
  }, [user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-zinc-200/50 rounded-lg w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-zinc-200/50 rounded-2xl border border-zinc-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
          <p className="text-sm font-medium text-zinc-500 mb-2">Total Profiles</p>
          <p className="text-4xl font-semibold text-zinc-900">{total.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
          <p className="text-sm font-medium text-zinc-500 mb-2">Your Role</p>
          <p className="text-4xl font-semibold text-zinc-900 capitalize">{user?.role}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
          <p className="text-sm font-medium text-zinc-500 mb-2">Welcome</p>
          <p className="text-4xl font-semibold text-zinc-900 truncate">@{user?.username}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
          <h2 className="text-lg font-medium text-zinc-900">Recent Profiles</h2>
        </div>
        <div className="divide-y divide-zinc-100">
          {recent.map((p) => (
            <div
              key={p.id}
              className="px-8 py-5 hover:bg-zinc-50 cursor-pointer transition-colors"
              onClick={() => router.push(`/profiles/${p.id}`)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-zinc-900">{p.name}</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    <span className="capitalize">{p.gender}</span> <span className="mx-1.5 text-zinc-300">•</span> {p.age} years <span className="mx-1.5 text-zinc-300">•</span> {p.country_name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
