// B"H
/**
 * StarterMovementMilestoneRuntime
 * A tiny movement watcher that can be called by the real update loop or tests.
 * It has no loop of its own. When a player meaningfully leaves the spawn breath,
 * it emits one starter movement signal and becomes silent.
 */
import { emitStarterSignal } from './StarterSignalBridge.js';
const dist2 = (a = {}, b = {}) => {
  const dx = Number(a.x || 0) - Number(b.x || 0), dy = Number(a.y || 0) - Number(b.y || 0), dz = Number(a.z || 0) - Number(b.z || 0);
  return dx * dx + dy * dy + dz * dz;
};
function posOf(target = {}) { return target.position || target.mesh?.position || target.player?.mesh?.position || target.chossid?.mesh?.position || null; }
export function createStarterMovementMilestone(scope = globalThis, options = {}) {
  const origin = options.origin || { x:0, y:0, z:0 };
  const threshold = Number(options.threshold || 3);
  const state = { fired:false, origin:{ ...origin }, threshold };
  return {
    state,
    sample(target = scope.__AWTSMOOS_OLAM__ || scope.olam || {}) {
      if (state.fired) return { ok:false, fired:true, reason:'already-fired' };
      const p = posOf(target);
      if (!p) return { ok:false, reason:'missing-position' };
      const moved2 = dist2(origin, p);
      if (moved2 < threshold * threshold) return { ok:false, reason:'below-threshold', moved:Math.sqrt(moved2) };
      state.fired = true;
      return emitStarterSignal('movement', { position:{ x:Number(p.x||0), y:Number(p.y||0), z:Number(p.z||0) }, moved:Math.sqrt(moved2), threshold }, scope);
    }
  };
}
export default createStarterMovementMilestone;
