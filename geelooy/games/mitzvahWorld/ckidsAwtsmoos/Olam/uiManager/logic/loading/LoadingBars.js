// B"H
/** Progress bars: the visual floor rises and never kneels back to zero. */
import { IDS } from "./LoadingConstants.js";
import { clamp } from "./LoadingDom.js";
import { state } from "./LoadingState.js";
import { width } from "./LoadingText.js";
export function displayedValue(key, value) {
  const next = clamp(value);
  const previous = Number(state[key] || 0);
  if (key === "total") {
    if (previous > 0 && next < previous) state.displayRegressionCount += 1;
    state.visualFloor = Math.max(state.visualFloor || 0, previous, next);
    if (state.visualFloor > 0) state.minDisplayedAfterStart ??= state.visualFloor;
    return state.visualFloor;
  }
  return Math.max(previous, next);
}
export function bar(key, value) {
  state[key] = displayedValue(key, value);
  width(IDS[key], state[key]);
}
export function completeBars() {
  state.total = state.world = state.worker = state.texture = 100;
  state.visualFloor = 100;
  for (const key of ["total", "world", "worker", "texture"]) width(IDS[key], 100);
}
