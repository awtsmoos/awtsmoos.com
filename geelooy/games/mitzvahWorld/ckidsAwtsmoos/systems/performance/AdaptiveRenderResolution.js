// B"H
/** @file AdaptiveRenderResolution.js @description Render-stage driven backbuffer governor. */
const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export const ADAPTIVE_RENDER_LIMITS = Object.freeze({
  minPixelRatio:0.65,
  maxPixelRatio:1.0,
  lowerRenderMs:34,
  lowerTotalMs:42,
  cooldownMs:1800,
  stepDown:0.1
});

function currentRatio(renderer) {
  return Math.max(0.1, n(renderer?.getPixelRatio?.(), 1));
}

function resizeRenderer(olam, ratio) {
  const renderer = olam?.renderer;
  if (!renderer) return false;
  const width = Math.max(1, n(olam.width, renderer.domElement?.width || 1024));
  const height = Math.max(1, n(olam.height, renderer.domElement?.height || 768));
  renderer.setPixelRatio(ratio);
  renderer.setSize?.(width, height, false);
  olam.refreshCameraAspect?.();
  return true;
}

export function applyAdaptiveRenderResolution(olam, stages = {}) {
  const renderer = olam?.renderer;
  if (!renderer) return null;
  const t = now();
  const state = olam.__adaptiveRenderResolution ||= {
    enabled:true,
    changes:0,
    minPixelRatio:ADAPTIVE_RENDER_LIMITS.minPixelRatio,
    maxPixelRatio:ADAPTIVE_RENDER_LIMITS.maxPixelRatio,
    lastChangeAt:0,
    history:[]
  };
  const renderMs = n(stages.render);
  const totalMs = n(stages.total);
  const ratio = currentRatio(renderer);
  let next = ratio;
  let reason = "hold";
  if (t - state.lastChangeAt >= ADAPTIVE_RENDER_LIMITS.cooldownMs) {
    if ((renderMs > ADAPTIVE_RENDER_LIMITS.lowerRenderMs || totalMs > ADAPTIVE_RENDER_LIMITS.lowerTotalMs) && ratio > state.minPixelRatio) {
      next = Math.max(state.minPixelRatio, Math.round((ratio - ADAPTIVE_RENDER_LIMITS.stepDown) * 100) / 100);
      reason = "render-cost-high";
    }
  }
  if (next !== ratio && resizeRenderer(olam, next)) {
    state.changes += 1;
    state.lastChangeAt = t;
    state.history.push({ at:Date.now(), from:ratio, to:next, reason, renderMs, totalMs });
    state.history = state.history.slice(-12);
  }
  const diag = {
    at:Date.now(),
    enabled:state.enabled,
    pixelRatio:currentRatio(renderer),
    minPixelRatio:state.minPixelRatio,
    maxPixelRatio:state.maxPixelRatio,
    changes:state.changes,
    lastReason:state.history[state.history.length - 1]?.reason || null,
    lastChange:state.history[state.history.length - 1] || null,
    renderMs,
    totalMs,
    history:state.history,
    seal:"adaptive-render-resolution-20260705-bh1"
  };
  olam.__adaptiveRenderResolutionDiag = diag;
  globalThis.__MITZVAH_RENDER_RESOLUTION_DIAG__ = () => diag;
  return diag;
}

export default applyAdaptiveRenderResolution;
