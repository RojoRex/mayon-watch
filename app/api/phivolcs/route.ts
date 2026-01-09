import { NextResponse } from "next/server";

const WOVODAT_API =
  "https://wovodat.phivolcs.dost.gov.ph/bulletin/list-of-bulletin";

type Bulletin = {
  volcano_name: string;
  alert_level?: number;
  bulletin_title?: string;
  date_published?: string;
};

async function fetchWithRetry(
  url: string,
  retries = 2,
  timeout = 8000
): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "MayonSafeZoneApp/1.0",
        },
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(id);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw new Error("Unreachable");
}

function getLatestMayonBulletin(bulletins: Bulletin[]) {
  return bulletins
    .filter(
      (b) => b.volcano_name && b.volcano_name.toLowerCase().includes("mayon")
    )
    .sort(
      (a, b) =>
        new Date(b.date_published || "").getTime() -
        new Date(a.date_published || "").getTime()
    )[0];
}

export async function GET() {
  try {
    const res = await fetchWithRetry(WOVODAT_API);
    const data = await res.json();

    const bulletin = getLatestMayonBulletin(data);

    if (!bulletin) {
      throw new Error("No Mayon bulletin found");
    }

    return NextResponse.json({
      source: "WOVOdat PHIVOLCS",
      volcano: "Mayon Volcano",
      alert:
        bulletin.alert_level !== undefined
          ? `Alert Level ${bulletin.alert_level}`
          : "Unknown",
      title: bulletin.bulletin_title ?? "Mayon Volcano Bulletin",
      publishDate: bulletin.date_published ?? null,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        source: "WOVOdat PHIVOLCS",
        alert: "Unknown",
        error: error.message,
        lastUpdated: new Date().toISOString(),
      },
      { status: 502 }
    );
  }
}
