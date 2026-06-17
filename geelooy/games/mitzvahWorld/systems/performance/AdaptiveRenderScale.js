// B"H
export function adaptiveRenderScale(tier = {}) { if (tier.tier === "high" && !tier.mobile) return 1; if (tier.tier === "medium") return tier.mobile ? .8 : .9; return tier.mobile ? .62 : .75; }
export function applyRenderScale(renderer, scale, win = globalThis.window) { if (!renderer || typeof renderer.setPixelRatio !== "function") return false; const dpr = Math.min(Number(win?.devicePixelRatio || 1), 2); renderer.setPixelRatio(Math.max(.5, Math.min(1.5, dpr * scale))); return true; }
export default adaptiveRenderScale;
