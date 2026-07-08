// B"H
/**
 * ConstructionLivingRuntime
 * File-by-file implementation of construction living-world behavior. Each action
 * records state deltas and can be stepped by the budgeted LivingWorldRuntime.
 */
import { rememberLivingWorld, recordLivingWorldEvent, livingWorldBucket } from './LivingWorldState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
function write(id, action, detail = {}) {
  recordLivingWorldEvent({ domain:'construction', id, action, detail });
  return rememberLivingWorld('construction', id, { action, detail });
}
export function applyConstructionSignal(id = 'construction', detail = {}) { return write(id, detail.action || 'signal', detail); }
export function constructionSnapshot(state = {}) { return state['construction'] || livingWorldBucket('construction'); }
export function stepConstructionLivingWorld(reason = 'scheduled', budget = {}) {
  const snapshot = constructionSnapshot();
  const keys = Object.keys(snapshot);
  return write('domain_step', 'step', { reason, budgetLevel:budget.level || budget.realism?.level || 'unknown', known:keys.length });
}
export function roadImprovement(id = 'road_improvement', detail = {}) { return write(id, 'road_improvement', detail); }
export function emergentPaths(id = 'emergent_paths', detail = {}) { return write(id, 'emergent_paths', detail); }
export function bridgeWear(id = 'bridge_wear', detail = {}) { return write(id, 'bridge_wear', detail); }
export function maintenance(id = 'maintenance', detail = {}) { return write(id, 'maintenance', detail); }
export function roofStormDamage(id = 'roof_storm_damage', detail = {}) { return write(id, 'roof_storm_damage', detail); }
export function villageExpansion(id = 'village_expansion', detail = {}) { return write(id, 'village_expansion', detail); }
export function neighborhoodIdentities(id = 'neighborhood_identities', detail = {}) { return write(id, 'neighborhood_identities', detail); }
export function publicGardens(id = 'public_gardens', detail = {}) { return write(id, 'public_gardens', detail); }
export function communityStorage(id = 'community_storage', detail = {}) { return write(id, 'community_storage', detail); }
export function irrigation(id = 'irrigation', detail = {}) { return write(id, 'irrigation', detail); }
export function wellDigging(id = 'well_digging', detail = {}) { return write(id, 'well_digging', detail); }
export function lampPosts(id = 'lamp_posts', detail = {}) { return write(id, 'lamp_posts', detail); }
export default { applyConstructionSignal, constructionSnapshot, stepConstructionLivingWorld, roadImprovement, emergentPaths, bridgeWear, maintenance, roofStormDamage, villageExpansion, neighborhoodIdentities, publicGardens, communityStorage, irrigation, wellDigging, lampPosts };
