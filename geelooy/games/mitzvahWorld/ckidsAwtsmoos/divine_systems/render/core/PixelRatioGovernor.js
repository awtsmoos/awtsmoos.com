// B"H
/**
 * @file PixelRatioGovernor.js
 * @description Chapter 422: settings can now command render mercy.
 */
export const PIXEL_RATIO_LIMITS = Object.freeze({ min: 0.75, max: 1.35, initialMax: 1.22, resizeMax: 1.16, mobileMax: 1.08, hugeScreenMax: 1.04, lowMemoryMax: 1.0 });
function n(value, fallback = 0) { const numeric = Number(value); return Number.isFinite(numeric) ? numeric : fallback; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function mobileSettings(sourceWindow = globalThis.window) { try { return JSON.parse(sourceWindow?.localStorage?.getItem?.("awtsmoosMobileSettings") || "{}"); } catch { return {}; } }
function qualityCap(settings) { if (settings.quality === "speed") return 0.92; if (settings.quality === "beauty") return 1.2; return 1.04; }
export function resolvePixelRatioCap(options = {}) {
  const width = Math.max(1, n(options.width, 1024)), height = Math.max(1, n(options.height, 768)), memoryGb = n(options.memoryGb, 8), cssPixels = width * height, phase = String(options.phase || "render");
  const caps = [PIXEL_RATIO_LIMITS.max, phase === "initial" ? PIXEL_RATIO_LIMITS.initialMax : PIXEL_RATIO_LIMITS.resizeMax];
  if (cssPixels >= 2200000) caps.push(PIXEL_RATIO_LIMITS.hugeScreenMax);
  if (width <= 900 || height <= 700) caps.push(PIXEL_RATIO_LIMITS.mobileMax);
  if (memoryGb > 0 && memoryGb <= 4) caps.push(PIXEL_RATIO_LIMITS.lowMemoryMax);
  if (options.settings) caps.push(qualityCap(options.settings));
  return Math.max(PIXEL_RATIO_LIMITS.min, Math.min(...caps));
}
export function resolvePixelRatio(options = {}) { const raw = Math.max(1, n(options.raw, 1)); const cap = resolvePixelRatioCap(options); return clamp(Math.min(raw, cap), PIXEL_RATIO_LIMITS.min, PIXEL_RATIO_LIMITS.max); }
export function measureRenderViewport(sourceWindow = globalThis.window, phase = "resize") {
  const width = Math.max(1, Math.floor(n(sourceWindow?.innerWidth, 1024))), height = Math.max(1, Math.floor(n(sourceWindow?.innerHeight, 768))), rawPixelRatio = Math.max(1, n(sourceWindow?.devicePixelRatio, 1));
  const settings = mobileSettings(sourceWindow);
  const pixelRatio = resolvePixelRatio({ raw: rawPixelRatio, width, height, phase, memoryGb: n(sourceWindow?.navigator?.deviceMemory, 8), settings });
  return { width, height, rawPixelRatio, pixelRatio, quality: settings.quality || "speed" };
}
