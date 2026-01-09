export const MAYON_CENTER = { lat: 13.257, lng: 123.685 };
export const MAYON_RADIUS_KM = 6; // default hazard radius (km)

export function toRad(v: number) {
  return (v * Math.PI) / 180;
}

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isInsideHazard(
  lat: number,
  lng: number,
  radiusKm = MAYON_RADIUS_KM
) {
  const d = haversineKm(lat, lng, MAYON_CENTER.lat, MAYON_CENTER.lng);
  return d <= radiusKm;
}
