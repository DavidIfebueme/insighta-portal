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
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Semantic Search</h1>
        <p className="text-zinc-500 mt-3 text-sm max-w-lg mx-auto">
          Use natural language queries to filter through profile intelligence data. Explore by gender, age group, or region.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-2 mb-10 transition-all hover:border-zinc-300 focus-within:border-zinc-900 focus-within:ring-4 focus-within:ring-zinc-100">
        <div className="flex gap-2 items-center">
          <svg className="w-5 h-5 ml-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder='e.g., "young males from nigeria" or "senior females"'
            className="flex-1 border-none focus:ring-0 bg-transparent px-3 py-3.5 text-zinc-900 placeholder-zinc-400 outline-none w-full"
            autoFocus
          />
          <button
            onClick={handleSearch}
            className="bg-zinc-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
        </div>
      )}

      {searched && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-medium text-zinc-500">
              Found <span className="text-zinc-900">{total}</span> results for &quot;<span className="text-zinc-900">{query}</span>&quot;
            </p>
          </div>
          
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-zinc-100">
              <thead className="bg-zinc-50/50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Gender</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Age</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Country</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-10 text-center text-sm text-zinc-500">
                      No profiles found matching your query. Please try different terms.
                    </td>
                  </tr>
                ) : (
                  results.map((p) => (
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
                      <td className="px-8 py-5 text-sm text-zinc-600">{p.age}</td>
                      <td className="px-8 py-5 text-sm text-zinc-600 font-medium">{p.country_name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
