// B"H
/** Progress bars: the visual floor rises and never kneels back to zero. */
import { IDS } from "./LoadingConstants.js";
import { clamp } from "./LoadingDom.js";
import { state } from "./LoadingState.js";
import { width } from "./LoadingText.js";
const START_FLOOR = 0;
function guarded(value) {
  const next = clamp(value);
  if (state.hadPositiveDisplay && next <= 0) return Math.max(state.visualFloor || 0, state.total || 0);
  return next;
}
export function displayedValue(key, value) {
  const next = guarded(value);
  const previous = Math.max(START_FLOOR, Number(state[key] || 0));
  if (key === "total") {
    if (previous > 0 && next < previous) state.displayRegressionCount += 1;
    state.visualFloor = Math.max(START_FLOOR, state.visualFloor || 0, previous, next);
    if (state.visualFloor > 0) state.hadPositiveDisplay = true;
    if (state.visualFloor > 0) state.minDisplayedAfterStart = Math.max(state.minDisplayedAfterStart || 0, state.visualFloor);
    return state.visualFloor;
  }
  return Math.max(START_FLOOR, previous, next);
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
