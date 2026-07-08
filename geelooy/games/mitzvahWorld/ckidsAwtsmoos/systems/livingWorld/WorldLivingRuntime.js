// B"H
/**
 * WorldLivingRuntime
 * File-by-file implementation of world living-world behavior. Each action
 * records state deltas and can be stepped by the budgeted LivingWorldRuntime.
 */
import { rememberLivingWorld, recordLivingWorldEvent, livingWorldBucket } from './LivingWorldState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
function write(id, action, detail = {}) {
  recordLivingWorldEvent({ domain:'world', id, action, detail });
  return rememberLivingWorld('world', id, { action, detail });
}
export function applyWorldSignal(id = 'world', detail = {}) { return write(id, detail.action || 'signal', detail); }
export function worldSnapshot(state = {}) { return state['world'] || livingWorldBucket('world'); }
export function stepWorldLivingWorld(reason = 'scheduled', budget = {}) {
  const snapshot = worldSnapshot();
  const keys = Object.keys(snapshot);
  return write('domain_step', 'step', { reason, budgetLevel:budget.level || budget.realism?.level || 'unknown', known:keys.length });
}
export function historicalArchives(id = 'historical_archives', detail = {}) { return write(id, 'historical_archives', detail); }
export function civilizationEvolution(id = 'civilization_evolution', detail = {}) { return write(id, 'civilization_evolution', detail); }
export function festivals(id = 'festivals', detail = {}) { return write(id, 'festivals', detail); }
export function emergencies(id = 'emergencies', detail = {}) { return write(id, 'emergencies', detail); }
export function cleanliness(id = 'cleanliness', detail = {}) { return write(id, 'cleanliness', detail); }
export function hiddenStories(id = 'hidden_stories', detail = {}) { return write(id, 'hidden_stories', detail); }
export function pilgrims(id = 'pilgrims', detail = {}) { return write(id, 'pilgrims', detail); }
export function caravans(id = 'caravans', detail = {}) { return write(id, 'caravans', detail); }
export function landmarks(id = 'landmarks', detail = {}) { return write(id, 'landmarks', detail); }
export function worldMemory(id = 'world_memory', detail = {}) { return write(id, 'world_memory', detail); }
export function regionalPolitics(id = 'regional_politics', detail = {}) { return write(id, 'regional_politics', detail); }
export function weatherHistory(id = 'weather_history', detail = {}) { return write(id, 'weather_history', detail); }
export default { applyWorldSignal, worldSnapshot, stepWorldLivingWorld, historicalArchives, civilizationEvolution, festivals, emergencies, cleanliness, hiddenStories, pilgrims, caravans, landmarks, worldMemory, regionalPolitics, weatherHistory };
