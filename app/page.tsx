"use client";

import React, { useEffect, useState } from "react";
import SafeZoneCard from "./components/SafeZoneCard";
import Map from "./components/Map";
import Hotlines from "./components/Hotlines";
import VolcanoStatus from "./components/VolcanoStatus";
import CheckLocation from "./components/CheckLocation";
import {
  haversineKm,
  MAYON_CENTER,
  MAYON_RADIUS_KM,
  isInsideHazard,
} from "./lib/geo";

type SafeZone = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  capacity?: string;
};

const SAFE_ZONES: SafeZone[] = [
  {
    id: "legazpi-sports",
    name: "Legazpi City Sports Complex",
    lat: 13.1381,
    lng: 123.744,
    address: "Legazpi City, Albay",
  },
  {
    id: "tabaco-evac",
    name: "Tabaco Evacuation Center",
    lat: 13.37,
    lng: 123.727,
    address: "Tabaco City, Albay",
  },
  {
    id: "daraga-evac",
    name: "Daraga Evacuation Site",
    lat: 13.133,
    lng: 123.733,
    address: "Daraga, Albay",
  },
  {
    id: "ligao-evac",
    name: "Ligao City Evacuation Site",
    lat: 13.033,
    lng: 123.544,
    address: "Ligao City, Albay",
  },
];

// use haversineKm from ./lib/geo

export default function Home() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition({ lat, lng });
        const dists: Record<string, number> = {};
        SAFE_ZONES.forEach((z) => {
          dists[z.id] = Number(haversineKm(lat, lng, z.lat, z.lng).toFixed(2));
        });
        setDistances(dists);
      },
      (err) => {
        setError(err.message ?? "Unable to retrieve location");
      },
      { enableHighAccuracy: true, maximumAge: 30_000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  const nearest = Object.keys(distances).sort(
    (a, b) => (distances[a] || Infinity) - (distances[b] || Infinity)
  )[0];

  const insideHazard = position
    ? isInsideHazard(position.lat, position.lng)
    : false;

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-sans overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-orange-900/40 to-red-900/40 rounded-full blur-3xl opacity-40" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tl from-blue-900/40 to-cyan-900/40 rounded-full blur-3xl opacity-40" />

      <header className="w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white py-8 px-6 relative z-10 shadow-lg border-b border-cyan-700/30">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            🌋 Mayon Safe-Zone Finder
          </h1>
          <p className="text-slate-300 text-lg">
            Real-time evacuation guidance and volcano monitoring for Mayon
            Volcano
          </p>
        </div>
      </header>

      <main className="w-full flex-1 flex flex-col px-4 sm:px-6 py-8 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <div className="rounded-xl shadow-lg overflow-hidden">
                <Map
                  zones={SAFE_ZONES}
                  position={position}
                  nearestId={nearest}
                />
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-bold text-white">
                  Evacuation Centers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SAFE_ZONES.map((z) => (
                    <SafeZoneCard
                      key={z.id}
                      zone={z}
                      distance={distances[z.id] ?? null}
                      isNearest={nearest === z.id}
                    />
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-4 lg:space-y-5">
              <CheckLocation />

              <div className="rounded-xl border border-slate-700 p-4 bg-slate-800 shadow-lg">
                <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  📍 Your Location
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="p-2.5 rounded-lg bg-slate-700 border border-slate-600">
                    <span className="text-slate-300 font-medium text-xs">
                      Coordinates:
                    </span>
                    <div className="text-white font-mono text-xs mt-1">
                      {position
                        ? `${position.lat.toFixed(4)}, ${position.lng.toFixed(
                            4
                          )}`
                        : "Unknown"}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-900/40 border border-blue-700">
                    <span className="text-slate-300 font-medium text-xs">
                      Nearest Zone:
                    </span>
                    <div className="text-white font-semibold mt-1 text-sm">
                      {nearest
                        ? SAFE_ZONES.find((s) => s.id === nearest)?.name
                        : "—"}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-700">
                    <span className="text-slate-300 font-medium text-xs">
                      Distance:
                    </span>
                    <div className="text-white font-bold text-base mt-1">
                      {nearest ? `${distances[nearest]} km` : "—"}
                    </div>
                  </div>
                  {!error && !position && (
                    <div className="p-2.5 rounded-lg bg-yellow-900/30 border border-yellow-700 text-xs text-yellow-300">
                      ℹ️ Enable location services to see your position
                    </div>
                  )}
                  {error && (
                    <div className="p-2.5 rounded-lg bg-red-900/30 border border-red-700 text-xs text-red-300">
                      ⚠️ {error}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-bold transition-colors"
                    onClick={() => {
                      setError(null);
                      if (!navigator.geolocation)
                        return setError("Geolocation not supported");
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const lat = pos.coords.latitude;
                          const lng = pos.coords.longitude;
                          setPosition({ lat, lng });
                          const dists: Record<string, number> = {};
                          SAFE_ZONES.forEach((z) => {
                            dists[z.id] = Number(
                              haversineKm(lat, lng, z.lat, z.lng).toFixed(2)
                            );
                          });
                          setDistances(dists);
                        },
                        (err) =>
                          setError(err.message ?? "Unable to retrieve location")
                      );
                    }}
                  >
                    📍 Update
                  </button>

                  <a
                    href="mailto:local_authorities@example.com?subject=Mayon%20Incident%20Report&body=Please%20describe%20the%20incident."
                    className="flex-1 rounded-lg border-2 border-slate-600 hover:bg-slate-700 text-slate-300 px-3 py-2 text-xs font-bold transition-colors text-center"
                  >
                    📧 Report
                  </a>
                </div>
              </div>
            </aside>
            <section className="lg:col-span-4 space-y-4 lg:space-y-5">
              <VolcanoStatus position={position} />

              <Hotlines />
            </section>
          </section>
        </div>
      </main>

      <footer className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700 text-slate-400 py-6 px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center text-xs sm:text-sm">
          <p>
            Stay safe. Follow official{" "}
            <a
              href="https://www.phivolcs.dost.gov.ph/"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors underline"
            >
              PHIVOLCS
            </a>{" "}
            and local authority advisories.
          </p>
          <p className="mt-2">
            🚨 For emergencies, call local authorities or{" "}
            <span className="font-semibold text-cyan-400">911</span>
          </p>
          <p className="mt-3 text-xs text-slate-500">
            © 2026 RojoRex. Mayon Safe-Zone Finder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
