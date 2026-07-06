// B"H
/**
 * @file PixelRatioGovernor.js
 * @description
 * The Awtsmoos breathes a crisp mobile vessel into the worker canvas.
 * This governor refuses the old tiny-DPR exile that smeared grass, hands,
 * faces, HUD portraits, animals, doors, and the village ground into a fog.
 *
 * Chapter of the living game:
 * A child enters Mitzvah World through glass held in the hand. The field must
 * not become a swamp of blurred pixels merely because the phone is small. The
 * vessel may be capped with mercy, but it must remain a vessel: CSS size times
 * chosen DPR, no secret shrinking in normal play, no false proof, only measured
 * light.
 */
export const PIXEL_RATIO_LIMITS = Object.freeze({
  min: 1.5,
  max: 2.0,
  initialMax: 2.0,
  resizeMax: 2.0,
  mobileMax: 2.0,
  hugeScreenMax: 1.75,
  lowMemoryMax: 1.5
});

function n(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function mobileSettings(sourceWindow = globalThis.window) {
  try { return JSON.parse(sourceWindow?.localStorage?.getItem?.("awtsmoosMobileSettings") || "{}"); }
  catch { return {}; }
}

function qualityCap(settings = {}) {
  if (settings.quality === "performance") return 1.5;
  if (settings.quality === "crisp") return 2.0;
  return 2.0;
}

function isMobileViewport(width, height, sourceWindow = globalThis.window) {
  const ua = String(sourceWindow?.navigator?.userAgent || "");
  const uaMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const coarse = Boolean(sourceWindow?.matchMedia?.("(pointer: coarse)")?.matches);
  return Boolean(uaMobile || width <= 820 || (coarse && width <= 1180 && height <= 960));
}

export function resolvePixelRatioCap(options = {}) {
  const width = Math.max(1, n(options.width, 1024));
  const height = Math.max(1, n(options.height, 768));
  const memoryGb = n(options.memoryGb, 8);
  const cssPixels = width * height;
  const phase = String(options.phase || "render");
  const caps = [PIXEL_RATIO_LIMITS.max, phase === "initial" ? PIXEL_RATIO_LIMITS.initialMax : PIXEL_RATIO_LIMITS.resizeMax];
  if (isMobileViewport(width, height, options.sourceWindow)) caps.push(PIXEL_RATIO_LIMITS.mobileMax);
  if (cssPixels >= 1200000) caps.push(PIXEL_RATIO_LIMITS.hugeScreenMax);
  if (memoryGb > 0 && memoryGb <= 4) caps.push(PIXEL_RATIO_LIMITS.lowMemoryMax);
  if (options.settings) caps.push(qualityCap(options.settings));
  return Math.max(PIXEL_RATIO_LIMITS.min, Math.min(...caps));
}

export function resolvePixelRatio(options = {}) {
  const raw = Math.max(1, n(options.raw, 1));
  const cap = resolvePixelRatioCap(options);
  return clamp(Math.min(raw, cap), PIXEL_RATIO_LIMITS.min, PIXEL_RATIO_LIMITS.max);
}

function publishReport(sourceWindow, report) {
  try {
    sourceWindow.__AWTSMOOS_PIXEL_RATIO_GOVERNOR__ = report;
    sourceWindow.dispatchEvent?.(new CustomEvent("awtsmoos:pixel-ratio-governed", { detail: report }));
  } catch {}
}

export function measureRenderViewport(sourceWindow = globalThis.window, phase = "resize") {
  const width = Math.max(1, Math.floor(n(sourceWindow?.innerWidth, 1024)));
  const height = Math.max(1, Math.floor(n(sourceWindow?.innerHeight, 768)));
  const rawPixelRatio = Math.max(1, n(sourceWindow?.devicePixelRatio, 1));
  const settings = mobileSettings(sourceWindow);
  const memoryGb = n(sourceWindow?.navigator?.deviceMemory, 8);
  const pixelRatio = resolvePixelRatio({ raw: rawPixelRatio, width, height, phase, memoryGb, settings, sourceWindow });
  const report = {
    width,
    height,
    rawPixelRatio,
    pixelRatio,
    memoryGb,
    phase,
    quality:settings.quality || "balanced",
    applied:pixelRatio < rawPixelRatio,
    crispMobileFloor:true,
    canvasBackingTarget:{ width:Math.floor(width * pixelRatio), height:Math.floor(height * pixelRatio) },
    seal:"crisp-mobile-pixel-governor-20260705-bh6"
  };
  publishReport(sourceWindow, report);
  return report;
}
