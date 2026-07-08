// B"H
/** Snapshot: the witness scroll for diagnostics and future regressions. */
import { SEAL } from "./LoadingConstants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { canvasInfo, canvasReady } from "./LoadingDom.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { state } from "./LoadingState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function snapshot() {
  return { ...state, log:[...state.log], canvasReady:canvasReady(), canvas:canvasInfo(), seal:SEAL };
}
