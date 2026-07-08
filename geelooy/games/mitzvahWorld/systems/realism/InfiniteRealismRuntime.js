// B"H
/**
 * @file InfiniteRealismRuntime.js
 * The runtime bridge that turns realism policy into cheap enforcement: renderer
 * budget, texture law, spatial interest, and tiny evidence reports.
 */
import { applyRenderBudget } from '../performance/RenderBudgetApplier.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { governMaterialTextures } from '../performance/MaterialTextureGovernor.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { updateFastRealismRuntimeOverlay } from '../performance/FastRealismRuntimeOverlay.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { createSpatialInterestRegistry } from './SpatialInterestRegistry.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';

function worldOf(scope) { return scope.__AWTSMOOS_OLAM__ || scope.olam || scope.ikar?.olam || scope.mana?.activeOlam || null; }
function playerOf(world) { return world?.player || world?.awduhm || world?.activePlayer || world?.nivrayim?.find?.(x => x?.isPlayer); }
function registerKnown(world, registry) {
  const groups = [['npc', world?.npcs], ['animal', world?.animals || world?.wildlife], ['mission', world?.missions]];
  for (const [kind, items] of groups) for (const item of items || []) registry.register(item.id || item.name || `${kind}-${registry.entries.size}`, item, kind);
}
export function createInfiniteRealismRuntime(scope = globalThis) {
  const registry = createSpatialInterestRegistry({ cellSize:64 });
  const state = { running:false, reports:[], lastTextureGovern:0, lastRegister:0 };
  function cycle(note = {}) {
    const world = worldOf(scope);
    const player = playerOf(world);
    if (Date.now() - state.lastRegister > 3000) {
      try { registerKnown(world, registry); state.lastRegister = Date.now(); } catch (error) { state.registerError = error.message; }
    }
    const renderReport = applyRenderBudget(scope);
    let textureReport = scope.__MITZVAH_TEXTURE_GOVERNOR_REPORT__ || null;
    if (Date.now() - state.lastTextureGovern > 5000) {
      textureReport = governMaterialTextures(scope);
      state.lastTextureGovern = Date.now();
    }
    const tiers = player ? registry.classifyAll(player, scope.__MITZVAH_MASTER_REALISM_POLICY__?.npcs?.perception || {}) : null;
    const overlay = updateFastRealismRuntimeOverlay(scope);
    const report = { at:Date.now(), note, renderReport, textureReport, spatial:registry.report(), tiers:tiers ? Object.fromEntries(Object.entries(tiers).map(([k, v]) => [k, v.length])) : null, overlay:Boolean(overlay) };
    state.reports.push(report);
    state.reports = state.reports.slice(-20);
    scope.__MITZVAH_INFINITE_REALISM_REPORT__ = report;
    scope.__MITZVAH_SPATIAL_INTEREST_REGISTRY__ = registry;
    return report;
  }
  function start() {
    if (state.running) return state;
    state.running = true;
    const loop = () => {
      if (!state.running) return;
      cycle({ source:'loop' });
      scope.setTimeout?.(loop, 1000);
    };
    loop();
    return state;
  }
  function stop() { state.running = false; return state; }
  return { state, registry, cycle, start, stop };
}
export default createInfiniteRealismRuntime;
