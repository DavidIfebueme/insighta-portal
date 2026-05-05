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
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Profiles</h1>
          <p className="text-zinc-500 mt-2 text-sm">Browse and filter user profiles</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="bg-white border border-zinc-200 text-zinc-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm"
          >
            Export CSV
          </button>
          {user?.role === "admin" && (
            <button
              onClick={() => router.push("/profiles?action=create")}
              className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Create Profile
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm mb-8 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={gender}
            onChange={(e) => { setGender(e.target.value); setPage(1); }}
            className="border-zinc-200 bg-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:border-zinc-300 focus:ring-zinc-100 transition-all font-medium text-zinc-700 hover:border-zinc-300"
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
            className="border-zinc-200 bg-white border rounded-lg px-4 py-2.5 text-sm w-48 outline-none focus:ring-2 focus:border-zinc-300 focus:ring-zinc-100 transition-all font-medium text-zinc-800 placeholder-zinc-400 hover:border-zinc-300"
          />
          <select
            value={ageGroup}
            onChange={(e) => { setAgeGroup(e.target.value); setPage(1); }}
            className="border-zinc-200 bg-white border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:border-zinc-300 focus:ring-zinc-100 transition-all font-medium text-zinc-700 hover:border-zinc-300"
          >
            <option value="">All Age Groups</option>
            <option value="child">Child</option>
            <option value="teenager">Teenager</option>
            <option value="adult">Adult</option>
            <option value="senior">Senior</option>
          </select>
          <div className="h-6 w-px bg-zinc-200 mx-2 hidden md:block"></div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border-zinc-200 bg-white border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:border-zinc-300 focus:ring-zinc-100 transition-all font-medium text-zinc-700 hover:border-zinc-300"
          >
            <option value="created_at">Sort by Date</option>
            <option value="age">Sort by Age</option>
            <option value="gender_probability">Sort by Gender Prob</option>
          </select>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="border-zinc-200 bg-white border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:border-zinc-300 focus:ring-zinc-100 transition-all font-medium text-zinc-700 hover:border-zinc-300"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-100">
                <thead className="bg-zinc-50/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Gender</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Age</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Country</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Gender Prob</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Country Prob</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {profiles.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-50/80 cursor-pointer transition-colors"
                      onClick={() => router.push(`/profiles/${p.id}`)}
                    >
                      <td className="px-8 py-5 text-sm font-medium text-zinc-900">{p.name}</td>
                      <td className="px-8 py-5 text-sm text-zinc-600 capitalize">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                          {p.gender}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-zinc-600">{p.age} <span className="text-zinc-400 ml-1">({p.age_group})</span></td>
                      <td className="px-8 py-5 text-sm text-zinc-900 font-medium">{p.country_name} <span className="text-zinc-400 font-normal ml-1">({p.country_id})</span></td>
                      <td className="px-8 py-5 text-sm text-zinc-600">{(p.gender_probability * 100).toFixed(0)}%</td>
                      <td className="px-8 py-5 text-sm text-zinc-600">{(p.country_probability * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <p className="text-sm font-medium text-zinc-500">
              Showing <span className="text-zinc-900">{total.toLocaleString()}</span> profiles <span className="mx-2">•</span> Page <span className="text-zinc-900">{page}</span> of {totalPages}
            </p>
            <div className="flex gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 text-sm font-medium border border-zinc-200 text-zinc-700 bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors shadow-sm"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 text-sm font-medium border border-zinc-200 text-zinc-700 bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors shadow-sm"
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
