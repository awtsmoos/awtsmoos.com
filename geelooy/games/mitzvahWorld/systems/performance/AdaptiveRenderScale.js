// B"H
/**
 * Aggressive render mercy. The Awtsmoos does not need wasteful pixels to be
 * seen; fewer shaded fragments means more living frames.
 */
export function adaptiveRenderScale(tier = {}) {
  if (tier.tier === "high" && !tier.mobile) return 1;
  if (tier.tier === "medium" && !tier.mobile) return 0.92;
  if (tier.tier === "medium") return 0.84;
  return tier.mobile ? 0.78 : 0.82;
}

export function pixelRatioCap(tier = {}) {
  if (tier.tier === "high" && !tier.mobile) return 1;
  if (tier.tier === "medium" && !tier.mobile) return 0.92;
  if (tier.tier === "medium") return 0.86;
  return tier.mobile ? 0.78 : 0.82;
}

export function desiredPixelRatio(win = globalThis.window, tier = {}, scale = 1) {
  const native = Number(win?.devicePixelRatio || 1);
  const cap = pixelRatioCap(tier);
  const pixelRatio = Math.max(0.72, Math.min(cap, native * scale));
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
