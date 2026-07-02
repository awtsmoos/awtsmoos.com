// B"H
/** Mutable loader state, kept tiny so every heartbeat can be inspected. */
export const state = {
  total:0, world:0, worker:0, texture:0,
  hidden:false, finalReady:false, log:[],
  startedAt:Date.now(), lastRealAt:Date.now(), heldHideReason:null, rawStage:""
};
export function rememberRealProgress() { state.lastRealAt = Date.now(); }
export function hold(reason) { state.heldHideReason = String(reason || "held until playable"); }
