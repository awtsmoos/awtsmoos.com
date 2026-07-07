// B"H
/**
 * @file AdaptiveRenderResolution.js
 * @description Adaptive canvas governor for real sustained gameplay.
 * It does not hide messages or fake FPS; it lowers pixel ratio only when the
 * measured worker loop proves the vessel is choking, then raises gently later.
 */
const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export const ADAPTIVE_RENDER_LIMITS = Object.freeze({
  minPixelRatio:1.0,
  maxPixelRatio:2.0,
  lowerRenderMs:12.5,
  lowerTotalMs:16.8,
  raiseRenderMs:8.5,
  raiseTotalMs:13.2,
  emergencySamples:2,
  calmSamples:240,
  cooldownMs:1200,
  raiseCooldownMs:9000,
  stepDown:0.25,
  stepUp:0.25
});
function currentRatio(renderer) { return Math.max(0.1, n(renderer?.getPixelRatio?.(), 1)); }
function resizeRenderer(olam, ratio) {
  const renderer = olam?.renderer;
  if (!renderer) return false;
  const width = Math.max(1, n(olam.width, renderer.domElement?.clientWidth || 1024));
  const height = Math.max(1, n(olam.height, renderer.domElement?.clientHeight || 768));
  renderer.setPixelRatio(ratio);
  renderer.setSize?.(width, height, false);
  const canvas = renderer.domElement;
  if (canvas) { canvas.width = Math.max(1, Math.floor(width * ratio)); canvas.height = Math.max(1, Math.floor(height * ratio)); }
  olam.refreshCameraAspect?.();
  return true;
}
function isEmergency(renderMs, totalMs) { return renderMs > ADAPTIVE_RENDER_LIMITS.lowerRenderMs || totalMs > ADAPTIVE_RENDER_LIMITS.lowerTotalMs; }
function isCalm(renderMs, totalMs) { return renderMs < ADAPTIVE_RENDER_LIMITS.raiseRenderMs && totalMs < ADAPTIVE_RENDER_LIMITS.raiseTotalMs; }
export function applyAdaptiveRenderResolution(olam, stages = {}) {
  const renderer = olam?.renderer;
  if (!renderer) return null;
  const t = now();
  const state = olam.__adaptiveRenderResolution ||= { enabled:true, changes:0, emergencyStreak:0, calmStreak:0, minPixelRatio:ADAPTIVE_RENDER_LIMITS.minPixelRatio, maxPixelRatio:ADAPTIVE_RENDER_LIMITS.maxPixelRatio, lastChangeAt:0, history:[] };
  const renderMs = n(stages.render), totalMs = n(stages.total), ratio = currentRatio(renderer);
  const emergency = isEmergency(renderMs, totalMs), calm = isCalm(renderMs, totalMs);
  state.emergencyStreak = emergency ? state.emergencyStreak + 1 : 0;
  state.calmStreak = calm ? state.calmStreak + 1 : 0;
  let next = ratio, reason = "hold";
  const canLower = state.enabled && state.emergencyStreak >= ADAPTIVE_RENDER_LIMITS.emergencySamples && t - state.lastChangeAt >= ADAPTIVE_RENDER_LIMITS.cooldownMs;
  const canRaise = state.enabled && state.calmStreak >= ADAPTIVE_RENDER_LIMITS.calmSamples && t - state.lastChangeAt >= ADAPTIVE_RENDER_LIMITS.raiseCooldownMs;
  if (canLower && ratio > state.minPixelRatio) {
    next = Math.max(state.minPixelRatio, Math.round((ratio - ADAPTIVE_RENDER_LIMITS.stepDown) * 100) / 100);
    reason = "sustained-gameplay-frame-budget";
    state.emergencyStreak = 0;
  } else if (canRaise && ratio < state.maxPixelRatio) {
    next = Math.min(state.maxPixelRatio, Math.round((ratio + ADAPTIVE_RENDER_LIMITS.stepUp) * 100) / 100);
    reason = "calm-gameplay-restore-crispness";
    state.calmStreak = 0;
  }
  if (next !== ratio && resizeRenderer(olam, next)) {
    state.changes += 1;
    state.lastChangeAt = t;
    state.history.push({ at:Date.now(), from:ratio, to:next, reason, renderMs, totalMs, emergencyStreak:state.emergencyStreak, calmStreak:state.calmStreak });
    state.history = state.history.slice(-20);
  }
  const diag = { at:Date.now(), enabled:state.enabled, pixelRatio:currentRatio(renderer), minPixelRatio:state.minPixelRatio, maxPixelRatio:state.maxPixelRatio, changes:state.changes, emergency, calm, emergencyStreak:state.emergencyStreak, calmStreak:state.calmStreak, adaptiveDownscaleDuringNormalPlay:currentRatio(renderer) < state.maxPixelRatio, lastReason:state.history[state.history.length - 1]?.reason || null, lastChange:state.history[state.history.length - 1] || null, renderMs, totalMs, history:state.history, seal:"adaptive-render-real-60fps-20260706-bh1" };
  olam.__adaptiveRenderResolutionDiag = diag;
  globalThis.__MITZVAH_RENDER_RESOLUTION_DIAG__ = () => diag;
  return diag;
}
export default applyAdaptiveRenderResolution;
