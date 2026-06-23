// B"H
/**
 * @file RenderBudgetApplier.js
 * The Awtsmoos shines without limit; this renderer receives only what the frame
 * vessel can carry. Pixel ratio, shadows, and heavy effects bend to measured FPS.
 */
function findRenderer(scope = globalThis) {
  return scope.__AWTSMOOS_RENDERER__ || scope.renderer || scope.mana?.renderer || scope.ikar?.renderer || null;
}
function findScene(scope = globalThis) {
  return scope.__AWTSMOOS_OLAM__?.scene || scope.olam?.scene || scope.mana?.activeOlam?.scene || scope.scene || null;
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, Number(v) || lo)); }
export function applyRenderBudget(scope = globalThis, budget = scope.__MITZVAH_WORLD_PERFORMANCE_BUDGET__) {
  const renderer = findRenderer(scope);
  const scene = findScene(scope);
  const rendering = budget?.rendering || {};
  const report = { at:Date.now(), applied:false, renderer:Boolean(renderer), scene:Boolean(scene), tier:budget?.tier || 'unknown', lights:0, shadowCasters:0 };
  if (!renderer || !budget) return report;
  const pixelRatio = clamp(rendering.maxPixelRatio || 1.25, 0.75, Math.max(1, scope.devicePixelRatio || 1));
  try { renderer.setPixelRatio?.(pixelRatio); report.pixelRatio = pixelRatio; } catch (error) { report.pixelRatioError = error.message; }
  try {
    if (renderer.shadowMap) {
      renderer.shadowMap.enabled = budget.tier !== 'survival';
      renderer.shadowMap.autoUpdate = budget.tier === 'ultra' || budget.tier === 'high';
      report.shadowMap = { enabled:renderer.shadowMap.enabled, autoUpdate:renderer.shadowMap.autoUpdate };
    }
  } catch (error) { report.shadowError = error.message; }
  scene?.traverse?.(object => {
    if (object?.isLight) {
      report.lights += 1;
      if (object.shadow?.mapSize) {
        const base = budget.tier === 'ultra' ? 2048 : budget.tier === 'high' ? 1536 : budget.tier === 'balanced' ? 1024 : 512;
        object.shadow.mapSize.width = base;
        object.shadow.mapSize.height = base;
      }
    }
    if (object?.castShadow) {
      report.shadowCasters += 1;
      if (budget.tier === 'survival' && !object.userData?.forceShadow) object.castShadow = false;
    }
  });
  report.applied = true;
  scope.__MITZVAH_RENDER_BUDGET_REPORT__ = report;
  return report;
}
export default applyRenderBudget;
