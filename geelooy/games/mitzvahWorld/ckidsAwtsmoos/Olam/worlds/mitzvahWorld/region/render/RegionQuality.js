// B"H
/** @file RegionQuality.js @description Density law without clever syntax, so every parser sees the vessel. */
const SPEED = new Set(["speed", "low", "android"]);
const BEAUTY = new Set(["beauty", "high", "ultra"]);
function budget() {
  return globalThis?.__AWTSMOOS_PERFORMANCE_MODE__?.budget || null;
}
function currentSettings() {
  if (typeof globalThis === "undefined") return {};
  return globalThis["__AWTSMOOS_MOBILE_SETTINGS__"] || {};
}
function rawQuality(olam) {
  const settings = currentSettings();
  if (settings.quality) return settings.quality;
  if (olam && olam.mobileQuality) return olam.mobileQuality;
  if (olam && olam.settings && olam.settings.quality) return olam.settings.quality;
  return "balanced";
}
export function regionQuality(olam = {}) {
  const raw = rawQuality(olam);
  const speed = SPEED.has(raw);
  const beauty = BEAUTY.has(raw);
  const density = speed ? 0.42 : beauty ? 1.15 : 0.72;
  const texture = speed ? 96 : beauty ? 192 : 128;
  return { raw, speed, beauty, density, texture };
}
export function qualityCount(olam, count) {
  return Math.max(1, Math.floor(Number(count || 0) * regionQuality(olam).density));
}
export function budgetedQualityCount(olam, count, budgetKey, fallbackCap) {
  const base = qualityCount(olam, count);
  const raw = Number(budget()?.[budgetKey]);
  const cap = Number.isFinite(raw) ? raw : fallbackCap;
  return Math.max(1, Math.min(base, Math.floor(Number(cap) || base)));
}
export function qualityEvery(olam, n) {
  return regionQuality(olam).speed ? Math.max(2, Number(n || 1) * 2) : n;
}
