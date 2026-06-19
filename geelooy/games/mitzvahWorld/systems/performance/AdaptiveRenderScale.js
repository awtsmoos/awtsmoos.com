// B"H
/**
 * Aggressive render mercy. The Awtsmoos does not need wasteful pixels to be
 * seen; fewer shaded fragments means more living frames.
 */
export function adaptiveRenderScale(tier = {}) {
  if (tier.tier === "high" && !tier.mobile) return 0.72;
  if (tier.tier === "medium" && !tier.mobile) return 0.62;
  if (tier.tier === "medium") return 0.54;
  return tier.mobile ? 0.48 : 0.52;
}

export function pixelRatioCap(tier = {}) {
  if (tier.tier === "high" && !tier.mobile) return 0.82;
  if (tier.tier === "medium" && !tier.mobile) return 0.72;
  if (tier.tier === "medium") return 0.62;
  return tier.mobile ? 0.55 : 0.6;
}

export function desiredPixelRatio(win = globalThis.window, tier = {}, scale = 1) {
  const native = Number(win?.devicePixelRatio || 1);
  const cap = pixelRatioCap(tier);
  const pixelRatio = Math.max(0.5, Math.min(cap, native * scale));
  return { native, cap, scale, pixelRatio };
}

export function applyRenderScale(renderer, scale, win = globalThis.window, tier = {}) {
  if (!renderer || typeof renderer.setPixelRatio !== "function") return { applied: false };
  const state = desiredPixelRatio(win, tier, scale);
  renderer.setPixelRatio(state.pixelRatio);
  renderer.info && (renderer.info.autoReset = true);
  return { applied: true, ...state };
}

export default adaptiveRenderScale;
