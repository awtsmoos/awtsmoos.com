// B"H
/** Heartbeat: keeps the loader alive; it does not forge playability. */
import { doc } from "./LoadingDom.js";
import { state } from "./LoadingState.js";
import { record } from "./LoadingLog.js";
let heartbeat = null;
export function startLoadingHeartbeat(update) {
  if (heartbeat || !doc() || state.hidden) return;
  heartbeat = setInterval(() => tick(update), 500);
}
export function stopLoadingHeartbeat() {
  if (heartbeat) clearInterval(heartbeat);
  heartbeat = null;
}
function tick(update) {
  if (state.hidden) return;
  const age = Date.now() - state.lastRealAt;
  doc()?.documentElement?.classList?.toggle?.("awtsmoos-loader-stalled", age > 2500);
  if (age > 16000 && state.total >= 94) record("Still waiting for playable proof; loader remains visible.");
  if (state.total > 0 && state.total < 98) update({
    stage:age > 2500 ? "heartbeat:still-loading" : "heartbeat:breathing",
    total:Math.min(98, state.total + (age > 2500 ? .18 : .04)),
    synthetic:true,
    subAction:"Still drawing the playable world."
  });
}
