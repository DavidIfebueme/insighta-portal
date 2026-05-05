"use client";

import { useAuth } from "@/lib/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-8">Account settings</h1>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-10">
        <div className="flex items-center gap-6 mb-10 pb-8 border-b border-zinc-100">
          {user.avatar_url ? (
            <Image src={user.avatar_url} alt="" width={80} height={80} className="w-20 h-20 rounded-full border border-zinc-200" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-3xl font-medium text-zinc-800">
              {user.username[0].toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">@{user.username}</h2>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-xs font-semibold bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-md uppercase tracking-wider">
                {user.role}
              </span>
              {user.is_active ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-sm font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Disabled
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-zinc-50">
            <div className="text-sm font-medium text-zinc-500 pt-1">Email address</div>
            <div className="sm:col-span-2 text-base font-medium text-zinc-900">
              {user.email || <span className="text-zinc-400 italic">Not provided</span>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-zinc-50">
            <div className="text-sm font-medium text-zinc-500 pt-1">User ID</div>
            <div className="sm:col-span-2 text-base font-mono text-zinc-600 bg-zinc-50 px-3 py-1.5 rounded-lg inline-block w-fit">
              {user.id}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-sm font-medium text-zinc-500 pt-1">Permissions</div>
            <div className="sm:col-span-2">
              <p className="text-base font-medium text-zinc-900 mb-1">
                {user.role === "admin" ? "Administrative Access" : "Analyst Access"}
              </p>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {user.role === "admin"
                  ? "You have full access to the platform. You can create, read, update, and delete all profiles, as well as export data."
                  : "You have read-only access. You can view, search, and export profiles, but you cannot create or delete any data."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
