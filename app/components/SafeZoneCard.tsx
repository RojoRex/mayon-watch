"use client";

import React from "react";

type SafeZone = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  capacity?: string;
};

export default function SafeZoneCard({
  zone,
  distance,
  isNearest,
}: {
  zone: SafeZone;
  distance: number | null | undefined;
  isNearest?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-lg p-4 transition-all duration-200 border ${
        isNearest
          ? "border-emerald-700 bg-gradient-to-r from-emerald-900/30 to-emerald-800/20 shadow-md ring-2 ring-emerald-700"
          : "border-slate-700 bg-slate-800 hover:shadow-md hover:border-blue-600"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg ${
            isNearest ? "bg-emerald-700" : "bg-blue-900"
          }`}
        >
          <svg
            className={`h-6 w-6 ${
              isNearest ? "text-emerald-300" : "text-blue-300"
            }`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="9" r="2.5" fill="currentColor" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{zone.name}</h3>
            {isNearest && (
              <span className="text-xs font-bold text-emerald-300 bg-emerald-900 px-2 py-1 rounded">
                ⭐ Nearest
              </span>
            )}
          </div>
          {zone.address && (
            <p className="text-xs text-slate-400 mt-1">{zone.address}</p>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="text-lg font-bold text-white">{distance ?? "—"} km</div>
        <a
          className="mt-2 inline-block text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded px-3 py-1 transition-colors"
          href={`https://www.google.com/maps/search/?api=1&query=${zone.lat},${zone.lng}`}
          target="_blank"
          rel="noreferrer"
        >
          Navigate →
        </a>
      </div>
    </div>
  );
}
