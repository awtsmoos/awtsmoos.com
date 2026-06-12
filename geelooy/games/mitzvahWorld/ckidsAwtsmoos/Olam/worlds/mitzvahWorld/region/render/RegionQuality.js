// B"H
/**
 * @file RegionQuality.js
 * @description Chapter 972: density must obey the vessel. The garden lives, but not by choking the phone.
 */
export function regionQuality(olam) {
  const raw = globalThis.__AWTSMOOS_MOBILE_SETTINGS__?.quality || olam?.mobileQuality || olam?.settings?.quality || "balanced";
  const speed = raw === "speed" || raw === "low" || raw === "android";
  const beauty = raw === "beauty" || raw === "high";
  return { raw, speed, beauty, density: speed ? .42 : beauty ? 1.15 : .72, texture: speed ? 96 : beauty ? 192 : 128 };
}
export function qualityCount(olam, count) { return Math.max(1, Math.floor(count * regionQuality(olam).density)); }
export function qualityEvery(olam, n) { return regionQuality(olam).speed ? Math.max(2, n * 2) : n; }
