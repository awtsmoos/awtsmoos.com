// B"H
/**
 * PhysicsLivingRuntime
 * File-by-file implementation of physics living-world behavior. Each action
 * records state deltas and can be stepped by the budgeted LivingWorldRuntime.
 */
import { rememberLivingWorld, recordLivingWorldEvent, livingWorldBucket } from './LivingWorldState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
function write(id, action, detail = {}) {
  recordLivingWorldEvent({ domain:'physics', id, action, detail });
  return rememberLivingWorld('physics', id, { action, detail });
}
export function applyPhysicsSignal(id = 'physics', detail = {}) { return write(id, detail.action || 'signal', detail); }
export function physicsSnapshot(state = {}) { return state['physics'] || livingWorldBucket('physics'); }
export function stepPhysicsLivingWorld(reason = 'scheduled', budget = {}) {
  const snapshot = physicsSnapshot();
  const keys = Object.keys(snapshot);
  return write('domain_step', 'step', { reason, budgetLevel:budget.level || budget.realism?.level || 'unknown', known:keys.length });
}
export function cloth(id = 'cloth', detail = {}) { return write(id, 'cloth', detail); }
export function rope(id = 'rope', detail = {}) { return write(id, 'rope', detail); }
export function currents(id = 'currents', detail = {}) { return write(id, 'currents', detail); }
export function turbulence(id = 'turbulence', detail = {}) { return write(id, 'turbulence', detail); }
export function snow(id = 'snow', detail = {}) { return write(id, 'snow', detail); }
export function mud(id = 'mud', detail = {}) { return write(id, 'mud', detail); }
export function sand(id = 'sand', detail = {}) { return write(id, 'sand', detail); }
export function footprints(id = 'footprints', detail = {}) { return write(id, 'footprints', detail); }
export function stacking(id = 'stacking', detail = {}) { return write(id, 'stacking', detail); }
export function collapse(id = 'collapse', detail = {}) { return write(id, 'collapse', detail); }
export function cartSuspension(id = 'cart_suspension', detail = {}) { return write(id, 'cart_suspension', detail); }
export function doorWeight(id = 'door_weight', detail = {}) { return write(id, 'door_weight', detail); }
export default { applyPhysicsSignal, physicsSnapshot, stepPhysicsLivingWorld, cloth, rope, currents, turbulence, snow, mud, sand, footprints, stacking, collapse, cartSuspension, doorWeight };
