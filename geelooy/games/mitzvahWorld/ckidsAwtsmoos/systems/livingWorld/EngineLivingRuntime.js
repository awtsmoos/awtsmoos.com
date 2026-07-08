// B"H
/**
 * EngineLivingRuntime
 * File-by-file implementation of engine living-world behavior. Each action
 * records state deltas and can be stepped by the budgeted LivingWorldRuntime.
 */
import { rememberLivingWorld, recordLivingWorldEvent, livingWorldBucket } from './LivingWorldState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
function write(id, action, detail = {}) {
  recordLivingWorldEvent({ domain:'engine', id, action, detail });
  return rememberLivingWorld('engine', id, { action, detail });
}
export function applyEngineSignal(id = 'engine', detail = {}) { return write(id, detail.action || 'signal', detail); }
export function engineSnapshot(state = {}) { return state['engine'] || livingWorldBucket('engine'); }
export function stepEngineLivingWorld(reason = 'scheduled', budget = {}) {
  const snapshot = engineSnapshot();
  const keys = Object.keys(snapshot);
  return write('domain_step', 'step', { reason, budgetLevel:budget.level || budget.realism?.level || 'unknown', known:keys.length });
}
export function sleepingIslands(id = 'sleeping_islands', detail = {}) { return write(id, 'sleeping_islands', detail); }
export function hierarchicalScheduling(id = 'hierarchical_scheduling', detail = {}) { return write(id, 'hierarchical_scheduling', detail); }
export function multiResolutionAi(id = 'multi_resolution_ai', detail = {}) { return write(id, 'multi_resolution_ai', detail); }
export function behaviorLod(id = 'behavior_lod', detail = {}) { return write(id, 'behavior_lod', detail); }
export function predictiveStreaming(id = 'predictive_streaming', detail = {}) { return write(id, 'predictive_streaming', detail); }
export function gpuVegetation(id = 'gpu_vegetation', detail = {}) { return write(id, 'gpu_vegetation', detail); }
export function parallelPathfinding(id = 'parallel_pathfinding', detail = {}) { return write(id, 'parallel_pathfinding', detail); }
export function eventNpcLogic(id = 'event_npc_logic', detail = {}) { return write(id, 'event_npc_logic', detail); }
export function frameBudgetSim(id = 'frame_budget_sim', detail = {}) { return write(id, 'frame_budget_sim', detail); }
export function deterministicWorld(id = 'deterministic_world', detail = {}) { return write(id, 'deterministic_world', detail); }
export function interestRings(id = 'interest_rings', detail = {}) { return write(id, 'interest_rings', detail); }
export function mutationBudgets(id = 'mutation_budgets', detail = {}) { return write(id, 'mutation_budgets', detail); }
export default { applyEngineSignal, engineSnapshot, stepEngineLivingWorld, sleepingIslands, hierarchicalScheduling, multiResolutionAi, behaviorLod, predictiveStreaming, gpuVegetation, parallelPathfinding, eventNpcLogic, frameBudgetSim, deterministicWorld, interestRings, mutationBudgets };
