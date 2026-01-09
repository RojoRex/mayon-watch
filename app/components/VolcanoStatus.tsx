"use client";

import React, { useEffect, useState } from "react";
import {
  MAYON_CENTER,
  MAYON_RADIUS_KM,
  isInsideHazard,
  haversineKm,
} from "../lib/geo";

export default function VolcanoStatus({
  position,
}: {
  position: { lat: number; lng: number } | null;
}) {
  const [alertLevel, setAlertLevel] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Placeholder refresh — in future we can fetch PHIVOLCS API or feed
  async function refresh() {
    setLastChecked(new Date().toISOString());
    try {
      const res = await fetch("/api/phivolcs");
      if (res.ok) {
        const data = await res.json();
        if (data.alert) setAlertLevel(data.alert);
      }
    } catch (e) {
      // keep placeholder
    }
  }

  const inside = position ? isInsideHazard(position.lat, position.lng) : false;
  const distToSummit = position
    ? haversineKm(
        position.lat,
        position.lng,
        MAYON_CENTER.lat,
        MAYON_CENTER.lng
      ).toFixed(2)
    : "—";

  React.useEffect(() => {
    // Initialize on mount to prevent hydration mismatch
    setMounted(true);
    setAlertLevel("Alert Level 3 (Very High Hazard)");
    setLastChecked(new Date().toISOString());
    // fetch once on mount
    refresh();
  }, []);

  return (
    <div className="rounded-xl border border-slate-700 p-4 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          🌋 Volcano Status
        </h3>
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
            inside
              ? "bg-red-600 text-white shadow-lg"
              : "bg-emerald-600 text-white shadow-lg"
          }`}
        >
          {inside ? "🚨 Inside Hazard" : "✅ Outside Hazard"}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-700 pt-3">
        <div
          className={`p-2.5 rounded-lg ${
            alertLevel?.includes("0") || alertLevel?.includes("1")
              ? "bg-green-900/30 border border-green-700"
              : alertLevel?.includes("2")
              ? "bg-yellow-900/30 border border-yellow-700"
              : "bg-red-900/30 border border-red-700"
          }`}
        >
          <div className="text-xs font-bold text-white">{alertLevel}</div>
          <div className="text-xs text-slate-300 mt-0.5">
            Last:{" "}
            {mounted && lastChecked
              ? new Date(lastChecked).toLocaleTimeString()
              : "—"}
          </div>
        </div>
        <div className="text-xs text-slate-300 bg-blue-900/30 p-2.5 rounded-lg border border-blue-700">
          <span className="font-semibold">Distance:</span>{" "}
          <span className="font-bold text-blue-300">{distToSummit} km</span>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={refresh}
          className="flex-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 text-xs font-bold transition-colors"
        >
          🔄 Refresh
        </button>
        <a
          href="https://www.phivolcs.dost.gov.ph/"
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-lg border-2 border-slate-600 hover:bg-slate-700 text-slate-300 px-3 py-1.5 text-xs font-bold transition-colors text-center"
        >
          📡 PHIVOLCS
        </a>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700">
        <h4 className="font-bold text-white mb-2 text-xs">⚠️ Safety Tips</h4>
        <ul className="space-y-1 text-xs text-slate-300">
          <li className="flex gap-1.5">
            <span className="text-sm">✓</span>{" "}
            <span>Follow local evacuation orders immediately.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-sm">✓</span>{" "}
            <span>Avoid river channels and low-lying areas (lahars).</span>
          </li>
          <li className="flex gap-2">
            <span className="text-sm">✓</span>{" "}
            <span>Use N95 masks to protect from ash inhalation.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-sm">✓</span>{" "}
            <span>Keep emergency kit and documents ready.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
