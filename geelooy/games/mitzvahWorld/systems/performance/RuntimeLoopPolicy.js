// B"H
/** RuntimeLoopPolicy: one tiny place for deferred/RAF policy in browser helpers. */
const scope = globalThis;
export function defer(label = 'defer', fn = () => {}, delayMs = 0) {
  const runner = () => fn({ label, at:Date.now() });
  if (delayMs <= 0 && scope.requestIdleCallback) return scope.requestIdleCallback(runner, { timeout:1000 });
  return scope.setTimeout?.(runner, Math.max(0, delayMs));
}
export function cancelDeferred(id) { try { scope.cancelIdleCallback?.(id); scope.clearTimeout?.(id); } catch {} }
export function rafLoop(label = 'raf-loop', onFrame = () => {}, options = {}) {
  const limit = Number(options.limit || 240);
  const state = { label, active:false, frames:0, id:0 };
  function tick(ts) { if (!state.active) return; state.frames += 1; onFrame(ts, state); if (state.frames < limit) state.id = scope.requestAnimationFrame(tick); else state.active = false; }
  return { state, start(){ if (!scope.requestAnimationFrame || state.active) return state; state.active = true; state.id = scope.requestAnimationFrame(tick); return state; }, stop(){ state.active = false; if (state.id) scope.cancelAnimationFrame?.(state.id); return state; } };
}
export default { defer, cancelDeferred, rafLoop };
