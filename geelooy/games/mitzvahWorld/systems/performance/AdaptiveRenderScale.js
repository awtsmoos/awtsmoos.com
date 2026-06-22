// B"H
/**
 * Native-crisp render contract. Performance mode may budget world work, but it
 * must not win frames by lowering the real gameplay pixel density.
 */
export function adaptiveRenderScale(tier = {}) {
  return 1;
}

export function pixelRatioCap(tier = {}) {
  return 1;
}

export function desiredPixelRatio(win = globalThis.window, tier = {}, scale = 1) {
  const native = Number(win?.devicePixelRatio || 1);
  const cap = pixelRatioCap(tier);
  const pixelRatio = Math.max(1, Math.min(cap, native * scale));
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
