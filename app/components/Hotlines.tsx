"use client";

import React from "react";

const HOTLINES = [
  {
    id: "emergency",
    name: "Emergency (National)",
    phone: "911",
    website: null,
    note: "Nationwide emergency number",
  },
  {
    id: "phivolcs",
    name: "PHIVOLCS (Volcano Monitoring)",
    phone: null,
    website: "https://www.phivolcs.dost.gov.ph/",
    note: "Official volcano monitoring agency — check website for contact info",
  },
  {
    id: "redcross",
    name: "Philippine Red Cross",
    phone: null,
    website: "https://www.redcross.org.ph/",
    note: "Disaster response and relief",
  },
  {
    id: "police",
    name: "Police (Local)",
    phone: null,
    website: null,
    note: "Contact your local police station",
  },
  {
    id: "fire",
    name: "Fire Department (Local)",
    phone: null,
    website: null,
    note: "Contact your local fire station",
  },
];

export default function Hotlines() {
  return (
    <div className="rounded-xl border border-red-700/50 p-4 bg-gradient-to-br from-red-900/20 via-orange-900/20 to-yellow-900/20 shadow-lg">
      <h3 className="text-base font-bold text-white mb-3">
        📞 Emergency Hotlines
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {HOTLINES.map((h) => (
          <div
            key={h.id}
            className="flex items-start gap-2 rounded-lg border border-slate-600 p-2.5 bg-slate-800/50 hover:shadow-md transition-shadow"
          >
            <div className="flex-shrink-0 p-1.5 rounded-lg bg-red-900/30">
              <svg
                className="h-4 w-4 text-red-400"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M22 16.92V21a1 1 0 0 1-1.11 1 19 19 0 0 1-8.63-3.07 19 19 0 0 1-6-6A19 19 0 0 1 2 3.11 1 1 0 0 1 3 2h4.09a1 1 0 0 1 1 .75c.12.74.35 1.45.66 2.12a1 1 0 0 1-.24 1.09L7.91 8.09a12 12 0 0 0 6 6l1.21-1.21a1 1 0 0 1 1.09-.24c.67.31 1.38.54 2.12.66a1 1 0 0 1 .75 1V21z"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-white">{h.name}</span>
                {h.phone && (
                  <a
                    href={`tel:${h.phone}`}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    {h.phone}
                  </a>
                )}
              </div>
              {h.note && (
                <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                  {h.note}
                </div>
              )}
              {h.website && (
                <a
                  href={h.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  🔗 Visit
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
