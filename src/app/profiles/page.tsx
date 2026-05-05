"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { listProfiles, exportProfiles } from "@/lib/api";

interface Profile {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  age: number;
  age_group: string;
  country_id: string;
  country_name: string;
  country_probability: number;
}

export default function ProfilesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: "15",
      };
      if (gender) params.gender = gender;
      if (country) params.country_id = country;
      if (ageGroup) params.age_group = ageGroup;
      if (sortBy) params.sort_by = sortBy;
      if (order) params.order = order;

      const data = await listProfiles(params);
      setProfiles(data.data);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch {
      console.error("Failed to load profiles");
    } finally {
      setLoading(false);
    }
  }, [page, gender, country, ageGroup, sortBy, order]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) loadProfiles();
  }, [user, authLoading, loadProfiles, router]);

  async function handleExport() {
    try {
      const params: Record<string, string> = {};
      if (gender) params.gender = gender;
      if (country) params.country_id = country;
      const csv = await exportProfiles(params);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `profiles_${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      console.error("Export failed");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profiles</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
          >
            Export CSV
          </button>
          {user?.role === "admin" && (
            <button
              onClick={() => router.push("/profiles?action=create")}
              className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700"
            >
              Create Profile
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={gender}
            onChange={(e) => { setGender(e.target.value); setPage(1); }}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <input
            type="text"
            placeholder="Country code (e.g. NG)"
            value={country}
            onChange={(e) => { setCountry(e.target.value.toUpperCase()); setPage(1); }}
            className="border rounded px-3 py-2 text-sm w-40"
          />
          <select
            value={ageGroup}
            onChange={(e) => { setAgeGroup(e.target.value); setPage(1); }}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">All Age Groups</option>
            <option value="child">Child</option>
            <option value="teenager">Teenager</option>
            <option value="adult">Adult</option>
            <option value="senior">Senior</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="created_at">Sort by Date</option>
            <option value="age">Sort by Age</option>
            <option value="gender_probability">Sort by Gender Prob</option>
          </select>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender Prob</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country Prob</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {profiles.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/profiles/${p.id}`)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">{p.gender}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.age} ({p.age_group})</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.country_name} ({p.country_id})</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{(p.gender_probability * 100).toFixed(0)}%</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{(p.country_probability * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              {total.toLocaleString()} profiles · Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 text-sm border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 text-sm border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
