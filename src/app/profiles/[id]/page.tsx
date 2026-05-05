"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getProfile, deleteProfile } from "@/lib/api";

interface ProfileData {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  age: number;
  age_group: string;
  country_id: string;
  country_name: string;
  country_probability: number;
  created_at: string;
}

export default function ProfileDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const data = await getProfile(id as string);
      setProfile(data.data);
    } catch {
      console.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) loadProfile();
  }, [user, authLoading, id, router, loadProfile]);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this profile?")) return;
    try {
      await deleteProfile(id as string);
      router.push("/profiles");
    } catch {
      console.error("Delete failed");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <h2 className="text-xl font-semibold text-zinc-900">Profile not found</h2>
        <p className="text-zinc-500 mt-2">The profile you are looking for does not exist or has been removed.</p>
        <button onClick={() => router.push("/profiles")} className="mt-6 text-sm font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600">
          Return to directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <button 
        onClick={() => router.push("/profiles")}
        className="mb-8 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-2"
      >
        ← Back to profiles
      </button>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-10">
        <div className="flex justify-between items-start mb-10 pb-8 border-b border-zinc-100">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{profile.name}</h1>
            <p className="text-zinc-500 mt-2 text-sm">Profile ID: {profile.id}</p>
          </div>
          {user?.role === "admin" && (
            <button
              onClick={handleDelete}
              className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Delete Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Gender</p>
            <p className="text-lg font-medium text-zinc-900 capitalize">{profile.gender}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Gender Probability</p>
            <p className="text-lg font-medium text-zinc-900">{(profile.gender_probability * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Age</p>
            <p className="text-lg font-medium text-zinc-900">{profile.age} years <span className="text-zinc-400 text-base font-normal ml-1">({profile.age_group})</span></p>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Country</p>
            <p className="text-lg font-medium text-zinc-900">{profile.country_name} <span className="text-zinc-400 text-base font-normal ml-1">({profile.country_id})</span></p>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Country Probability</p>
            <p className="text-lg font-medium text-zinc-900">{(profile.country_probability * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Profile Created</p>
            <p className="text-lg font-medium text-zinc-900">{new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
