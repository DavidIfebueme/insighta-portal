"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { searchProfiles } from "@/lib/api";

interface SearchResult {
  id: string;
  name: string;
  gender: string;
  age: number;
  country_name: string;
}

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchProfiles(query);
      setResults(data.data);
      setTotal(data.total);
    } catch {
      console.error("Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Profiles</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder='Try "young males from nigeria" or "senior females from kenya"'
            className="flex-1 border rounded px-4 py-2"
          />
          <button
            onClick={handleSearch}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Search
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Use natural language: gender, age group, country name
        </p>
      </div>

      {loading && <div className="text-center py-8 text-gray-700">Searching...</div>}

      {searched && !loading && (
        <>
          <p className="text-sm text-gray-700 mb-4">{total} results for &quot;{query}&quot;</p>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Country</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/profiles/${p.id}`)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 capitalize">{p.gender}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{p.age}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{p.country_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
