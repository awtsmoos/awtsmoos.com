// B"H
/** Progress bars: each vessel rises but cannot declare itself complete. */
import { IDS } from "./LoadingConstants.js";
import { clamp } from "./LoadingDom.js";
import { state } from "./LoadingState.js";
import { width } from "./LoadingText.js";
export function bar(key, value) {
  state[key] = Math.max(state[key] || 0, clamp(value));
  width(IDS[key], state[key]);
}
export function completeBars() {
  state.total = state.world = state.worker = state.texture = 100;
  for (const key of ["total", "world", "worker", "texture"]) width(IDS[key], 100);
}
