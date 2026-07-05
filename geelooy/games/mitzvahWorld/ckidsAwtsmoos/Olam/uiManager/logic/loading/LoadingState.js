// B"H
/**
 * Mutable loader state.
 * The Awtsmoos makes the world every instant; this vessel remembers the visual
 * floor so no later raw phase can drag a child's screen back to zero.
 */
const sessionId = `load-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const state = {
  total:0, world:0, worker:0, texture:0,
  rawTotal:0, visualFloor:0, displayRegressionCount:0,
  sessionId, sessionResetCount:0, hidden:false, finalReady:false,
  log:[], startedAt:Date.now(), lastRealAt:Date.now(), rawStage:"",
  heldHideReason:null, loaderAnimationFramesDuringStall:0,
  slowestBlockingStage:"unknown", blockingStages:{}, minDisplayedAfterStart:null
};
export function rememberRealProgress(stage = "progress") {
  state.lastRealAt = Date.now();
  state.slowestBlockingStage = String(stage || state.slowestBlockingStage);
}
export function hold(reason) { state.heldHideReason = String(reason || "held until playable"); }
