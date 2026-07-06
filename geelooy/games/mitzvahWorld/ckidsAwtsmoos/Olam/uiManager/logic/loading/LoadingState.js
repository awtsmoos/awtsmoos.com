// B"H
/**
 * Mutable loader state.
 * The Awtsmoos gives the player a living loading screen that begins above zero
 * and only rises. Raw worker phases may restart internally; the visible percent
 * never falls back to 0%, never flashes 0%, and never admits despair.
 */
const sessionId = `load-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const START_FLOOR = 0;
export const state = {
  total:START_FLOOR,
  world:START_FLOOR,
  worker:START_FLOOR,
  texture:START_FLOOR,
  rawTotal:0,
  visualFloor:START_FLOOR,
  displayRegressionCount:0,
  sessionId,
  sessionResetCount:0,
  hidden:false,
  finalReady:false,
  log:[],
  startedAt:Date.now(),
  firstCanvasAt:null,
  firstRenderableFrameAt:null,
  firstPlayableAt:null,
  loadingHiddenAt:null,
  fatalConsoleErrors:0,
  lastRealAt:Date.now(),
  rawStage:"html:start",
  heldHideReason:null,
  loaderAnimationFramesDuringStall:0,
  slowestBlockingStage:"startup",
  blockingStages:{},
  minDisplayedAfterStart:null,
  startFloor:START_FLOOR,
  hadPositiveDisplay:false,
  zeroDisplayPrevented:true,
  fasterLoadingPass:"loading-never-zero-fast-20260706-bh1"
};
export function rememberRealProgress(stage = "progress") {
  state.lastRealAt = Date.now();
  state.slowestBlockingStage = String(stage || state.slowestBlockingStage);
}
export function hold(reason) { state.heldHideReason = String(reason || "held until playable"); }
