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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Profiles</p>
          <p className="text-3xl font-bold text-indigo-600">{total.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Your Role</p>
          <p className="text-3xl font-bold text-gray-900 capitalize">{user?.role}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Welcome</p>
          <p className="text-3xl font-bold text-gray-900">@{user?.username}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Profiles</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recent.map((p) => (
            <div
              key={p.id}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => router.push(`/profiles/${p.id}`)}
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="text-sm text-gray-500">
                    {p.gender} · {p.age} years · {p.country_name}
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
