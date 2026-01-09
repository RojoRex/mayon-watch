"use client";

import React, { useEffect, useRef } from "react";
import { MAYON_CENTER, MAYON_RADIUS_KM } from "../lib/geo";

type SafeZone = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
};

export default function Map({
  zones,
  position,
  nearestId,
}: {
  zones: SafeZone[];
  position: { lat: number; lng: number } | null;
  nearestId?: string;
}) {
  const el = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const markersRef = useRef<any | null>(null);
  const mayonRef = useRef<any | null>(null);

  // MAYON_CENTER and MAYON_RADIUS_KM are imported from `app/lib/geo`

  useEffect(() => {
    let mounted = true;

    async function setup() {
      if (!el.current) return;

      // dynamically import leaflet so this module can be server-safe
      const L = (await import("leaflet")) as any;

      if (!mapRef.current) {
        mapRef.current = L.map(el.current, {
          center: [13.1381, 123.7],
          zoom: 11,
          preferCanvas: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapRef.current);

        markersRef.current = L.layerGroup().addTo(mapRef.current);
      }

      const mg = markersRef.current!;
      mg.clearLayers();

      zones.forEach((z) => {
        const isNearest = z.id === nearestId;
        const circle = L.circleMarker([z.lat, z.lng], {
          radius: isNearest ? 9 : 6,
          color: isNearest ? "#16a34a" : "#2563eb",
          fillColor: isNearest ? "#bbf7d0" : "#bfdbfe",
          weight: 2,
          fillOpacity: 0.9,
        }).bindPopup(`<strong>${z.name}</strong><br/>${z.address ?? ""}`);
        circle.addTo(mg);
      });

      if (position) {
        const you = L.circleMarker([position.lat, position.lng], {
          radius: 7,
          color: "#f97316",
          fillColor: "#fed7aa",
          weight: 2,
          fillOpacity: 0.9,
        }).bindPopup("You are here");
        you.addTo(mg);
      }

      // Draw Mayon volcano hazard overlay (circle) and add to marker group
      if (mayonRef.current) {
        try {
          mg.removeLayer(mayonRef.current);
        } catch (e) {
          // ignore
        }
        mayonRef.current = null;
      }

      try {
        const mayonCircle = L.circle([MAYON_CENTER.lat, MAYON_CENTER.lng], {
          radius: MAYON_RADIUS_KM * 1000, // meters
          color: "#dc2626",
          weight: 2,
          fillColor: "#fecaca",
          fillOpacity: 0.18,
          dashArray: "6 6",
        }).bindPopup(
          `<strong>Mayon Volcano Hazard Zone</strong><br/>Radius: ${MAYON_RADIUS_KM} km`
        );
        mayonCircle.addTo(mg);
        mayonRef.current = mayonCircle;
      } catch (e) {
        // ignore
      }

      // Fit to markers & position
      try {
        const group = L.featureGroup(mg.getLayers() as any[]);
        const bounds = group.getBounds();
        if (bounds.isValid() && mapRef.current) {
          mapRef.current.fitBounds(bounds.pad(0.5));
        }
      } catch (e) {
        // ignore
      }
    }

    setup();

    return () => {
      mounted = false;
      // don't attempt to remove the map here; leaving Leaflet map alive across hydration is okay
    };
  }, [zones, position, nearestId]);

  return <div ref={el} className="h-56 w-full rounded" />;
}
