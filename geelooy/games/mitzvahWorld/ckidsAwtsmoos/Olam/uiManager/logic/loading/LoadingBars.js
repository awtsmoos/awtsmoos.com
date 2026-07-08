// B"H
/**
 * @file LoadingBars.js
 * @description Monotonic visual progress writes for the therapeutic loader.
 */
import { IDS } from "./LoadingConstants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { clamp } from "./LoadingDom.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { state } from "./LoadingState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { width } from "./LoadingText.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const START_FLOOR = 0;

/**
 * B"H
 * Converts raw loader updates into display-safe values.
 * Internal boot phases can restart; visible bars and diagnostics cannot regress.
 *
 * @param {string} key Progress key.
 * @param {number} value Raw value.
 * @returns {number} Monotonic display value.
 */
export function displayedValue(key, value) {
  const raw = clamp(value);
  const previous = Math.max(START_FLOOR, Number(state[key] || 0));
  const floor = key === "total"
    ? Math.max(START_FLOOR, state.visualFloor || 0, previous)
    : Math.max(START_FLOOR, previous);
  const next = state.hadPositiveDisplay && raw <= 0 ? floor : Math.max(floor, raw);

  if (key === "total") {
    if (next < previous) state.displayRegressionCount += 1;
    state.visualFloor = Math.max(state.visualFloor || 0, next);
    if (next > 0) state.hadPositiveDisplay = true;
    if (next > 0) state.minDisplayedAfterStart = Math.max(state.minDisplayedAfterStart || 0, next);
  }

  return next;
}

/**
 * B"H
 * Writes one bar after updating the shared diagnostic state.
 *
 * @param {string} key Progress key.
 * @param {number} value Raw value.
 */
export function bar(key, value) {
  state[key] = displayedValue(key, value);
  width(IDS[key], state[key]);
}

/**
 * B"H
 * Completes all visible bars when true playable proof arrives.
 */
export function completeBars() {
  state.total = state.world = state.worker = state.texture = 100;
  state.visualFloor = 100;
  state.hadPositiveDisplay = true;
  for (const key of ["total", "world", "worker", "texture"]) width(IDS[key], 100);
}
