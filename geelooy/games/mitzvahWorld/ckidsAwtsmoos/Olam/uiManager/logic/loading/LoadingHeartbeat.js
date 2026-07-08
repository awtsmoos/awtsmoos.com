// B"H
/** Heartbeat: stalled generation still gets living animation frames. */
import { doc } from "./LoadingDom.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { state } from "./LoadingState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { record } from "./LoadingLog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
let heartbeat = null;
export function startLoadingHeartbeat(update) {
  if (heartbeat || !doc() || state.hidden) return;
  heartbeat = setInterval(() => tick(update), 250);
}
export function stopLoadingHeartbeat() {
  if (heartbeat) clearInterval(heartbeat);
  heartbeat = null;
}
function tick(update) {
  if (state.hidden) return;
  const age = Date.now() - state.lastRealAt;
  if (age > 700) state.loaderAnimationFramesDuringStall += 1;
  doc()?.documentElement?.classList?.toggle?.("awtsmoos-loader-stalled", age > 2500);
  if (age > 16000 && state.total >= 94) record("Still waiting for playable proof; loader remains visible.");
  if (state.total > 0 && state.total < 98) update({
    stage:age > 2500 ? "heartbeat:still-loading" : "heartbeat:breathing",
    total:Math.min(98, state.total + (age > 2500 ? .22 : .05)),
    synthetic:true, subAction:"Still drawing the playable world."
  });
}
