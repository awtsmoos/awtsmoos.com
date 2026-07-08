// B"H
/**
 * EcologyLivingRuntime
 * File-by-file implementation of ecology living-world behavior. Each action
 * records state deltas and can be stepped by the budgeted LivingWorldRuntime.
 */
import { rememberLivingWorld, recordLivingWorldEvent, livingWorldBucket } from './LivingWorldState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
function write(id, action, detail = {}) {
  recordLivingWorldEvent({ domain:'ecology', id, action, detail });
  return rememberLivingWorld('ecology', id, { action, detail });
}
export function applyEcologySignal(id = 'ecology', detail = {}) { return write(id, detail.action || 'signal', detail); }
export function ecologySnapshot(state = {}) { return state['ecology'] || livingWorldBucket('ecology'); }
export function stepEcologyLivingWorld(reason = 'scheduled', budget = {}) {
  const snapshot = ecologySnapshot();
  const keys = Object.keys(snapshot);
  return write('domain_step', 'step', { reason, budgetLevel:budget.level || budget.realism?.level || 'unknown', known:keys.length });
}
export function predatorPrey(id = 'predator_prey', detail = {}) { return write(id, 'predator_prey', detail); }
export function insects(id = 'insects', detail = {}) { return write(id, 'insects', detail); }
export function pollination(id = 'pollination', detail = {}) { return write(id, 'pollination', detail); }
export function forestSuccession(id = 'forest_succession', detail = {}) { return write(id, 'forest_succession', detail); }
export function soilFertility(id = 'soil_fertility', detail = {}) { return write(id, 'soil_fertility', detail); }
export function territories(id = 'territories', detail = {}) { return write(id, 'territories', detail); }
export function migration(id = 'migration', detail = {}) { return write(id, 'migration', detail); }
export function riverDrift(id = 'river_drift', detail = {}) { return write(id, 'river_drift', detail); }
export function erosion(id = 'erosion', detail = {}) { return write(id, 'erosion', detail); }
export function fireEcology(id = 'fire_ecology', detail = {}) { return write(id, 'fire_ecology', detail); }
export function mushroomBlooms(id = 'mushroom_blooms', detail = {}) { return write(id, 'mushroom_blooms', detail); }
export function seedSpread(id = 'seed_spread', detail = {}) { return write(id, 'seed_spread', detail); }
export default { applyEcologySignal, ecologySnapshot, stepEcologyLivingWorld, predatorPrey, insects, pollination, forestSuccession, soilFertility, territories, migration, riverDrift, erosion, fireEcology, mushroomBlooms, seedSpread };
