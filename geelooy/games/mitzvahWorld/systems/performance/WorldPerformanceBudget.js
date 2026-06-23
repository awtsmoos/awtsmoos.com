// B"H
/**
 * @file WorldPerformanceBudget.js
 * A measured covenant: more revelation when frames are strong, less hidden labor
 * when the vessel groans. The Awtsmoos is infinite; the GPU is not.
 */
export const QUALITY_TIERS = Object.freeze({
  ULTRA: "ultra",
  HIGH: "high",
  BALANCED: "balanced",
  SURVIVAL: "survival"
});
function n(v, fallback = 0) { const x = Number(v); return Number.isFinite(x) ? x : fallback; }
export function classifyPerformanceBudget(input = {}) {
  const fps = n(input.fps, 60);
  const p95 = n(input.p95FrameMs, fps ? 1000 / fps : 16.67);
  const drawCalls = n(input.drawCalls ?? input.renderer?.render?.calls, 0);
  const triangles = n(input.triangles ?? input.scene?.triangles, 0);
  const visibleMeshes = n(input.visibleMeshes ?? input.scene?.visibleMeshes, 0);
  const heap = n(input.usedJSHeapSize ?? input.memory?.usedJSHeapSize, 0);
  const pressure = [fps < 45, p95 > 28, drawCalls > 1400, triangles > 1800000, visibleMeshes > 2400, heap > 900_000_000].filter(Boolean).length;
  const tier = pressure >= 3 || fps < 45 ? QUALITY_TIERS.SURVIVAL : fps < 55 || pressure === 2 ? QUALITY_TIERS.BALANCED : fps < 60 || pressure === 1 ? QUALITY_TIERS.HIGH : QUALITY_TIERS.ULTRA;
  const scale = tier === QUALITY_TIERS.ULTRA ? 1 : tier === QUALITY_TIERS.HIGH ? 0.82 : tier === QUALITY_TIERS.BALANCED ? 0.58 : 0.32;
  return {
    tier,
    scale,
    fpsTarget: 60,
    reason: { fps, p95FrameMs:p95, drawCalls, triangles, visibleMeshes, heap, pressure },
    rendering: {
      shadowScale: tier === QUALITY_TIERS.SURVIVAL ? 0.35 : tier === QUALITY_TIERS.BALANCED ? 0.55 : tier === QUALITY_TIERS.HIGH ? 0.78 : 1,
      maxPixelRatio: tier === QUALITY_TIERS.SURVIVAL ? 1 : tier === QUALITY_TIERS.BALANCED ? 1.15 : tier === QUALITY_TIERS.HIGH ? 1.5 : 2,
      postprocessing: tier === QUALITY_TIERS.ULTRA || tier === QUALITY_TIERS.HIGH
    },
    simulation: {
      nearHz: tier === QUALITY_TIERS.SURVIVAL ? 12 : tier === QUALITY_TIERS.BALANCED ? 20 : 30,
      midHz: tier === QUALITY_TIERS.SURVIVAL ? 2 : tier === QUALITY_TIERS.BALANCED ? 4 : 6,
      farHz: tier === QUALITY_TIERS.SURVIVAL ? 0.2 : 1,
      horizonMode: "statistical"
    },
    density: {
      animals: Math.max(0.2, scale),
      npcs: Math.max(0.25, scale),
      foliage: Math.max(0.22, scale),
      missions: tier === QUALITY_TIERS.SURVIVAL ? 2 : tier === QUALITY_TIERS.BALANCED ? 4 : 7,
      villageProps: Math.max(0.25, scale)
    }
  };
}
export function mergeRuntimeBudget(previous, next) {
  if (!previous) return next;
  if (!next) return previous;
  return { ...previous, ...next, reason:{...previous.reason, ...next.reason}, rendering:{...previous.rendering, ...next.rendering}, simulation:{...previous.simulation, ...next.simulation}, density:{...previous.density, ...next.density} };
}
export default classifyPerformanceBudget;
