// B"H
/**
 * @file PixelRatioGovernor.js
 * @description
 * Chapter 421: The eye learned mercy and speed in one breath.
 *
 * A canvas can become too proud of its own sharpness. Raw device pixel ratio
 * may ask the renderer to draw two, three, or four times the visible world,
 * and then the village stutters while every blade waits for light. This small
 * governor receives the screen as data, bows the ratio into a sane vessel, and
 * lets the world move quickly without turning soft or jagged.
 */

/**
 * Shared numeric caps for the renderer.
 *
 * @type {Readonly<{
 *   min: number,
 *   max: number,
 *   initialMax: number,
 *   resizeMax: number,
 *   mobileMax: number,
 *   hugeScreenMax: number,
 *   lowMemoryMax: number
 * }>}
 */
export const PIXEL_RATIO_LIMITS = Object.freeze({
  min: 0.85,
  max: 1.35,
  initialMax: 1.22,
  resizeMax: 1.16,
  mobileMax: 1.08,
  hugeScreenMax: 1.04,
  lowMemoryMax: 1.0
});

/**
 * Converts any incoming value into a finite number.
 *
 * @param {unknown} value Candidate number.
 * @param {number} fallback Value returned when the candidate is not finite.
 * @returns {number} A finite numeric value.
 */
function n(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

/**
 * Clamps a number into a stable range.
 *
 * @param {number} value Incoming number.
 * @param {number} min Lower bound.
 * @param {number} max Upper bound.
 * @returns {number} Bounded number.
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Resolves the maximum ratio allowed for the current viewport.
 *
 * @param {object} options Decision data.
 * @param {number} [options.width] CSS viewport width.
 * @param {number} [options.height] CSS viewport height.
 * @param {number} [options.memoryGb] Browser-reported device memory.
 * @param {string} [options.phase] Render phase, usually "initial" or "resize".
 * @returns {number} The phase-aware maximum pixel ratio.
 */
export function resolvePixelRatioCap(options = {}) {
  const width = Math.max(1, n(options.width, 1024));
  const height = Math.max(1, n(options.height, 768));
  const memoryGb = n(options.memoryGb, 8);
  const cssPixels = width * height;
  const phase = String(options.phase || "render");

  const caps = [
    PIXEL_RATIO_LIMITS.max,
    phase === "initial" ? PIXEL_RATIO_LIMITS.initialMax : PIXEL_RATIO_LIMITS.resizeMax
  ];

  if (cssPixels >= 2200000) caps.push(PIXEL_RATIO_LIMITS.hugeScreenMax);
  if (width <= 900 || height <= 700) caps.push(PIXEL_RATIO_LIMITS.mobileMax);
  if (memoryGb > 0 && memoryGb <= 4) caps.push(PIXEL_RATIO_LIMITS.lowMemoryMax);

  return Math.max(PIXEL_RATIO_LIMITS.min, Math.min(...caps));
}

/**
 * Produces the pixel ratio used by the renderer and backing canvas.
 *
 * @param {object} options Decision data.
 * @param {number} [options.raw] Raw browser device pixel ratio.
 * @param {number} [options.width] CSS viewport width.
 * @param {number} [options.height] CSS viewport height.
 * @param {number} [options.memoryGb] Browser-reported device memory.
 * @param {string} [options.phase] Render phase, usually "initial" or "resize".
 * @returns {number} A practical pixel ratio that preserves speed and clarity.
 */
export function resolvePixelRatio(options = {}) {
  const raw = Math.max(1, n(options.raw, 1));
  const cap = resolvePixelRatioCap(options);
  return clamp(Math.min(raw, cap), PIXEL_RATIO_LIMITS.min, PIXEL_RATIO_LIMITS.max);
}

/**
 * Reads browser dimensions and returns a complete render sizing packet.
 *
 * @param {Window} sourceWindow Browser window object.
 * @param {string} [phase] Render phase.
 * @returns {{ width: number, height: number, rawPixelRatio: number, pixelRatio: number }}
 * Measurement payload for main-thread to worker transfer.
 */
export function measureRenderViewport(sourceWindow = globalThis.window, phase = "resize") {
  const width = Math.max(1, Math.floor(n(sourceWindow?.innerWidth, 1024)));
  const height = Math.max(1, Math.floor(n(sourceWindow?.innerHeight, 768)));
  const rawPixelRatio = Math.max(1, n(sourceWindow?.devicePixelRatio, 1));
  const pixelRatio = resolvePixelRatio({
    raw: rawPixelRatio,
    width,
    height,
    phase,
    memoryGb: n(sourceWindow?.navigator?.deviceMemory, 8)
  });

  return { width, height, rawPixelRatio, pixelRatio };
}

