"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccountPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token]);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-6">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl text-indigo-600">
              {user.username[0].toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">@{user.username}</h2>
            <span className="text-sm bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
              {user.role}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user.email || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Account Status</p>
            <p className="font-medium">
              {user.is_active ? (
                <span className="text-green-600">Active</span>
              ) : (
                <span className="text-red-600">Disabled</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Permissions</p>
            <p className="font-medium text-sm">
              {user.role === "admin"
                ? "Full access: create, read, update, delete profiles"
                : "Read-only: view and search profiles"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
