// B"H
/** Feature49HousingRuntime: personality interiors and visible renovations. */
import { mutateFeature49State } from './Feature49State.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function interiorForOwner(owner = { id:'owner', traits:['kind'] }) {
  const traits = owner.traits || [];
  return { ownerId: owner.id, books: traits.includes('learner') ? 12 : 3, tools: traits.includes('builder') ? 8 : 1, candles: traits.includes('warm') ? 6 : 2, color: traits.includes('humble') ? 'soft-earth' : 'village-blue' };
}
export function saveInterior(ownerId = 'home_1', interior = {}) { return mutateFeature49State(s => { s.interiors ||= {}; s.interiors[ownerId] = { ...interior, savedAt: Date.now() }; return s; }); }
export function visibleRenovation(id = 'study_house', stage = 1) { return mutateFeature49State(s => { s.renovations ||= {}; s.renovations[id] = Math.max(s.renovations[id] || 0, stage); return s; }); }
export function renovationVisual(id = 'study_house', state = {}) { const stage = state.renovations?.[id] || 0; return { id, scaffolding: stage > 0 && stage < 3, freshPaint: stage >= 2, expandedRoom: stage >= 4 }; }
export default { interiorForOwner, saveInterior, visibleRenovation, renovationVisual };
