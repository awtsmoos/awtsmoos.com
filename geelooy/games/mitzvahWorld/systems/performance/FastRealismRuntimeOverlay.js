// B"H
/** @file FastRealismRuntimeOverlay.js @description Tiny non-blocking report chip for realism/FPS state. */
export function updateFastRealismRuntimeOverlay(scope = globalThis) {
  const doc = scope.document;
  if (!doc) return null;
  const budget = scope.__MITZVAH_WORLD_PERFORMANCE_BUDGET__;
  const policy = scope.__MITZVAH_MASTER_REALISM_POLICY__;
  let el = doc.getElementById('awtsmoosFastRealismChip');
  if (!el) {
    el = doc.createElement('div');
    el.id = 'awtsmoosFastRealismChip';
    el.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:9200;pointer-events:none;padding:5px 7px;border-radius:8px;background:rgba(0,0,0,.48);color:#ffe8a3;font:700 10px/1.25 ui-monospace,monospace;max-width:44vw;opacity:.76';
    doc.body.appendChild(el);
  }
  el.textContent = `B\"H realism:${policy?.master?.tier || budget?.tier || 'boot'} fpsTarget:${budget?.fpsTarget || 60}`;
  return el;
}
export default updateFastRealismRuntimeOverlay;
