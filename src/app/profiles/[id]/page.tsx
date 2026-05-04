"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getProfile, deleteProfile } from "@/lib/api";

export default function ProfileDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadProfile();
  }, [token, id]);

  async function loadProfile() {
    try {
      const data = await getProfile(token!, id as string);
      setProfile(data.data);
    } catch {
      console.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this profile?")) return;
    try {
      await deleteProfile(token!, id as string);
      router.push("/profiles");
    } catch {
      console.error("Delete failed");
    }
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-6 py-8 text-gray-500">Loading...</div>;
  }

  if (!profile) {
    return <div className="max-w-7xl mx-auto px-6 py-8 text-red-500">Profile not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
          {user?.role === "admin" && (
            <button
              onClick={handleDelete}
              className="text-red-600 text-sm hover:text-red-800"
            >
              Delete
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <p className="font-medium capitalize">{profile.gender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gender Probability</p>
            <p className="font-medium">{(profile.gender_probability * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Age</p>
            <p className="font-medium">{profile.age} years ({profile.age_group})</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Country</p>
            <p className="font-medium">{profile.country_name} ({profile.country_id})</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Country Probability</p>
            <p className="font-medium">{(profile.country_probability * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
