// B"H
/** @file LoadingHeartbeat.js @description Passive status only; never resets CSS animation state. */
import { doc } from "./LoadingDom.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { state } from "./LoadingState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { record } from "./LoadingLog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

let heartbeat = null;
let lastLogAt = 0;

export function startLoadingHeartbeat() {
  if (heartbeat || !doc() || state.hidden) return;
  heartbeat = setInterval(tick, 5000);
}

export function stopLoadingHeartbeat() {
  if (heartbeat) clearInterval(heartbeat);
  heartbeat = null;
  lastLogAt = 0;
}

function tick() {
  if (state.hidden) return;
  state.loaderAnimationFramesDuringStall += 1;
  const age = Date.now() - state.lastRealAt;
  if (age < 12000 || Date.now() - lastLogAt < 12000) return;
  lastLogAt = Date.now();
  record(document.hidden ? "Still loading in the background; no retry needed." : "Still loading; waiting for the worker's next proof.");
}
