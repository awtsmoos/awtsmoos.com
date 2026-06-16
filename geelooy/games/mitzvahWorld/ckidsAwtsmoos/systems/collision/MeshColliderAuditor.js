// B"H
/** @file MeshColliderAuditor.js @description Finds visual-solid lies and missing parcel collision vows. */
import { isVisualSolidViolation } from "./CollisionTruthContract.js";
export function auditSceneColliders(root, manifest = []) {
  const visualSolidViolations = [], colliders = [];
  root?.traverse?.(o => { if (isVisualSolidViolation(o)) visualSolidViolations.push(o.name || o.uuid); if (o?.userData?.isSolid || o?.userData?.explicitCollision) colliders.push(o.name || o.uuid); });
  const missing = manifest.filter(m => !m.house?.required || !m.door?.required || !m.gate?.required).map(m => m.parcelId);
  return { ok: visualSolidViolations.length === 0 && missing.length === 0, visualSolidViolations, missing, colliderCount: colliders.length, colliders };
}
export function auditParcelContracts(parcels = []) {
  const problems = [];
  for (const p of parcels) { if (!p.houseId) problems.push(`${p.id}:missing-house`); if (!p.gate) problems.push(`${p.id}:missing-gate`); if (!p.fences?.length) problems.push(`${p.id}:missing-fences`); if (!p.garden) problems.push(`${p.id}:missing-garden`); }
  return { ok: problems.length === 0, problems, count: parcels.length };
}
export default { auditSceneColliders, auditParcelContracts };
