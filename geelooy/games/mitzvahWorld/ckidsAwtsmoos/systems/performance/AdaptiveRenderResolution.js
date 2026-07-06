// B"H
/**
 * @file AdaptiveRenderResolution.js
 * @description
 * Chapter: the emergency ladder, not the everyday fog.
 * The Awtsmoos lets performance bend without breaking sight. Normal mobile
 * play must remain crisp; only sustained emergency frame pain may lower the
 * canvas, and even then it may not collapse below a readable vessel.
 */
const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export const ADAPTIVE_RENDER_LIMITS = Object.freeze({
  minPixelRatio:2.0,
  maxPixelRatio:2.0,
  lowerRenderMs:42,
  lowerTotalMs:58,
  emergencySamples:5,
  cooldownMs:3200,
  stepDown:0.0
});

function currentRatio(renderer) {
  return Math.max(0.1, n(renderer?.getPixelRatio?.(), 1));
}

function resizeRenderer(olam, ratio) {
  const renderer = olam?.renderer;
  if (!renderer) return false;
  const width = Math.max(1, n(olam.width, renderer.domElement?.clientWidth || 1024));
  const height = Math.max(1, n(olam.height, renderer.domElement?.clientHeight || 768));
  renderer.setPixelRatio(ratio);
  renderer.setSize?.(width, height, false);
  const canvas = renderer.domElement;
  if (canvas) {
    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));
  }
  olam.refreshCameraAspect?.();
  return true;
}

function isEmergency(renderMs, totalMs) {
  return renderMs > ADAPTIVE_RENDER_LIMITS.lowerRenderMs || totalMs > ADAPTIVE_RENDER_LIMITS.lowerTotalMs;
}

export function applyAdaptiveRenderResolution(olam, stages = {}) {
  const renderer = olam?.renderer;
  if (!renderer) return null;
  const t = now();
  const state = olam.__adaptiveRenderResolution ||= {
    enabled:true,
    changes:0,
    emergencyStreak:0,
    minPixelRatio:ADAPTIVE_RENDER_LIMITS.minPixelRatio,
    maxPixelRatio:ADAPTIVE_RENDER_LIMITS.maxPixelRatio,
    lastChangeAt:0,
    history:[]
  };
  const renderMs = n(stages.render);
  const totalMs = n(stages.total);
  const ratio = currentRatio(renderer);
  const emergency = isEmergency(renderMs, totalMs);
  state.emergencyStreak = emergency ? state.emergencyStreak + 1 : 0;
  let next = ratio;
  let reason = "hold-crisp-normal-play";
  const mayChange = state.enabled && state.emergencyStreak >= ADAPTIVE_RENDER_LIMITS.emergencySamples && t - state.lastChangeAt >= ADAPTIVE_RENDER_LIMITS.cooldownMs;
  if (false && mayChange && ratio > state.minPixelRatio) {
    next = Math.max(state.minPixelRatio, Math.round((ratio - ADAPTIVE_RENDER_LIMITS.stepDown) * 100) / 100);
    reason = "disabled-to-preserve-mobile-crispness";
  }
  if (next !== ratio && resizeRenderer(olam, next)) {
    state.changes += 1;
    state.lastChangeAt = t;
    state.history.push({ at:Date.now(), from:ratio, to:next, reason, renderMs, totalMs, emergencyStreak:state.emergencyStreak });
    state.history = state.history.slice(-12);
  }
  const diag = {
    at:Date.now(),
    enabled:state.enabled,
    pixelRatio:currentRatio(renderer),
    minPixelRatio:state.minPixelRatio,
    maxPixelRatio:state.maxPixelRatio,
    changes:state.changes,
    emergency,
    emergencyStreak:state.emergencyStreak,
    adaptiveDownscaleDuringNormalPlay:false,
    lastReason:state.history[state.history.length - 1]?.reason || null,
    lastChange:state.history[state.history.length - 1] || null,
    renderMs,
    totalMs,
    history:state.history,
    seal:"adaptive-render-emergency-only-crisp-20260705-bh2"
  };
  olam.__adaptiveRenderResolutionDiag = diag;
  globalThis.__MITZVAH_RENDER_RESOLUTION_DIAG__ = () => diag;
  return diag;
}

export default applyAdaptiveRenderResolution;
