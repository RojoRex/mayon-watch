"use client";

import React, { useState } from "react";
import { isInsideHazard, haversineKm, MAYON_CENTER } from "../lib/geo";

interface SearchResult {
  lat: number;
  lng: number;
  name: string;
  inside: boolean;
  distance: number;
}

export default function CheckLocation() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) {
      setError("Please enter a location");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Use OpenStreetMap Nominatim API (free, no key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=1`
      );

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      if (!data || data.length === 0) {
        setError("Location not found. Try a different search.");
        setLoading(false);
        return;
      }

      const place = data[0];
      const lat = parseFloat(place.lat);
      const lng = parseFloat(place.lon);
      const inside = isInsideHazard(lat, lng);
      const distance = haversineKm(
        lat,
        lng,
        MAYON_CENTER.lat,
        MAYON_CENTER.lng
      );

      setResult({
        lat,
        lng,
        name: place.display_name || query,
        inside,
        distance: parseFloat(distance.toFixed(2)),
      });
    } catch (err: any) {
      setError(err.message || "Failed to search location");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-blue-700/50 p-4 bg-gradient-to-br from-blue-900/30 via-cyan-900/30 to-blue-900/30 shadow-lg">
      <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
        🔍 Check Location Safety
      </h3>

      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex gap-2 w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter address..."
            className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs whitespace-nowrap transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {loading ? "..." : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-3 p-2.5 rounded-lg bg-red-900/30 border border-red-700 text-red-300 text-xs">
          ❌ {error}
        </div>
      )}

      {result && (
        <div className="mt-3 space-y-2.5">
          <div className="p-2.5 rounded-lg bg-slate-700 border border-slate-600">
            <div className="text-xs text-slate-300 font-medium">Location</div>
            <div className="text-white font-semibold mt-1 line-clamp-2 text-sm">
              {result.name}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">
              {result.lat.toFixed(4)}, {result.lng.toFixed(4)}
            </div>
          </div>

          <div
            className={`p-2.5 rounded-lg border ${
              result.inside
                ? "bg-red-900/30 border-red-700"
                : "bg-emerald-900/30 border-emerald-700"
            }`}
          >
            <div className="flex items-start gap-1.5">
              <span className="text-base mt-0.5">
                {result.inside ? "🚨" : "✅"}
              </span>
              <div>
                <div
                  className={`font-bold text-xs ${
                    result.inside ? "text-red-300" : "text-emerald-300"
                  }`}
                >
                  {result.inside ? "INSIDE HAZARD" : "SAFE"}
                </div>
                <div
                  className={`text-xs mt-0.5 ${
                    result.inside ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {result.inside
                    ? "Within 6km hazard zone"
                    : `${result.distance.toFixed(1)} km from summit`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
