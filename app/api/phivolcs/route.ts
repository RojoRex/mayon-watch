import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

/* =========================
   CONFIG
========================= */

const WOVODAT_API =
  "https://wovodat.phivolcs.dost.gov.ph/bulletin/list-of-bulletin";

const HAZARDHUNTER_URL =
  "https://hazardhunter.georisk.gov.ph/monitoring/volcano";

const CACHE_DURATION = 15 * 60 * 1000; // 15 mins

const FALLBACK_LEVEL = 3;

const ALERT_DESCRIPTIONS: Record<number, string> = {
  0: "No Alert - Background level",
  1: "Low Level Unrest",
  2: "Moderate Unrest",
  3: "High Unrest - Magmatic activity",
  4: "Hazardous Eruption Imminent",
  5: "Hazardous Eruption Ongoing",
};

/* =========================
   TYPES
========================= */

type Bulletin = {
  volcano_name?: string;
  alert_level?: number | null;
  bulletin_title?: string | null;
  date_published?: string | null;
};

type AlertResponse = {
  volcano: string;
  alertLevel: number;
  description: string;
  updatedAt: string;
  source: string;
  cached: boolean;
};

/* =========================
   CACHE (memory)
========================= */

let cache: { data: AlertResponse; timestamp: number } | null = null;

/* =========================
   UTILITIES
========================= */

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  ms = 8000
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    return res;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

function extractAlertFromTitle(title?: string | null): number | null {
  if (!title) return null;
  const match = title.match(/alert level\s*(\d)/i);
  return match ? Number(match[1]) : null;
}

/* =========================
   PHIVOLCS (PRIMARY)
========================= */

async function fetchFromPHIVOLCS(): Promise<AlertResponse | null> {
  const res = await fetchWithTimeout(
    WOVODAT_API,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "MayonSafeZoneApp/1.0",
      },
      cache: "no-store",
    },
    8000
  );

  if (!res.ok) return null;

  const raw = await res.json();
  const bulletins: Bulletin[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
    ? raw.data
    : [];

  const mayon = bulletins
    .filter(
      (b) =>
        typeof b.volcano_name === "string" &&
        b.volcano_name.toLowerCase().includes("mayon")
    )
    .sort((a, b) => {
      const da = a.date_published
        ? new Date(a.date_published).getTime()
        : 0;
      const db = b.date_published
        ? new Date(b.date_published).getTime()
        : 0;
      return db - da;
    })[0];

  if (!mayon) return null;

  const level =
    typeof mayon.alert_level === "number"
      ? mayon.alert_level
      : extractAlertFromTitle(mayon.bulletin_title);

  if (level === null) return null;

  return {
    volcano: "Mayon Volcano",
    alertLevel: level,
    description: ALERT_DESCRIPTIONS[level],
    updatedAt:
      mayon.date_published ?? new Date().toISOString().split("T")[0],
    source: "PHIVOLCS (WOVOdat)",
    cached: false,
  };
}

/* =========================
   HAZARDHUNTER (FALLBACK)
========================= */

function parseHazardHunter(html: string) {
  const $ = cheerio.load(html);
  let level: number | null = null;
  let date: string | null = null;

  $("h2").each((_: any, el: any) => {
    if (/mayon/i.test($(el).text())) {
      const container = $(el).parent();
      const levelText = container.find("h4").text();

      const match = levelText.match(/alert level\s*(\d)/i);
      if (match) level = Number(match[1]);

      const dateMatch = container
        .text()
        .match(/Since\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i);
      if (dateMatch) date = dateMatch[1];
    }
  });

  return { level, date };
}

async function fetchFromHazardHunter(): Promise<AlertResponse | null> {
  try {
    const res = await fetchWithTimeout(
      HAZARDHUNTER_URL,
      {
        headers: {
          Accept: "text/html",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      },
      6000
    );

    if (!res.ok) throw new Error();

    const html = await res.text();
    const { level, date } = parseHazardHunter(html);

    if (level === null) return null;

    return {
      volcano: "Mayon Volcano",
      alertLevel: level,
      description: ALERT_DESCRIPTIONS[level],
      updatedAt: date ?? new Date().toISOString().split("T")[0],
      source: "HazardHunterPH",
      cached: false,
    };
  } catch {
    return null;
  }
}

/* =========================
   API ROUTE
========================= */

export async function GET() {
  try {
    const now = Date.now();

    if (cache && now - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json({ ...cache.data, cached: true });
    }

    // 1️⃣ PHIVOLCS first
    const phivolcs = await fetchFromPHIVOLCS();
    if (phivolcs) {
      cache = { data: phivolcs, timestamp: now };
      return NextResponse.json(phivolcs);
    }

    // 2️⃣ HazardHunter fallback
    const hazard = await fetchFromHazardHunter();
    if (hazard) {
      cache = { data: hazard, timestamp: now };
      return NextResponse.json(hazard);
    }

    // 3️⃣ Hard fallback
    return NextResponse.json({
      volcano: "Mayon Volcano",
      alertLevel: FALLBACK_LEVEL,
      description: ALERT_DESCRIPTIONS[FALLBACK_LEVEL],
      updatedAt: new Date().toISOString().split("T")[0],
      source: "static-fallback",
      cached: false,
    });
  } catch {
    return NextResponse.json(
      {
        volcano: "Mayon Volcano",
        alertLevel: FALLBACK_LEVEL,
        description: ALERT_DESCRIPTIONS[FALLBACK_LEVEL],
        updatedAt: new Date().toISOString().split("T")[0],
        source: "error-fallback",
        cached: false,
      },
      { status: 200 }
    );
  }
}
