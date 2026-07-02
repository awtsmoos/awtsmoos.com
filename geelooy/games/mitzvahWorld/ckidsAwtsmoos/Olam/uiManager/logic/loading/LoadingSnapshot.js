// B"H
/** Snapshot: the witness scroll for diagnostics and future regressions. */
import { SEAL } from "./LoadingConstants.js";
import { canvasReady } from "./LoadingDom.js";
import { state } from "./LoadingState.js";
export function snapshot() {
  return { ...state, log:[...state.log], canvasReady:canvasReady(), seal:SEAL };
}
