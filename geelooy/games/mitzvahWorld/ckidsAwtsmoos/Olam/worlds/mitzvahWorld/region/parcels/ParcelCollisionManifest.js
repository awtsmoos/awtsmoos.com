// B"H
/** @file ParcelCollisionManifest.js @description Declares exact collider obligations per parcel. */
export function manifestForParcel(parcel) {
  return {
    parcelId: parcel.id,
    house: { houseId: parcel.houseId, policy: "measuredShellCollider", required: true, doorId: `${parcel.houseId}_door` },
    door: { id: `${parcel.houseId}_door`, lockId: `${parcel.houseId}_door_lock`, keyId: parcel.keyId, required: true },
    gate: { id: parcel.gate.id, lockId: parcel.gate.lockId, keyId: parcel.gate.keyId, required: true, closedCollider: true },
    fences: parcel.fences.map(f => ({ id: f.id, visualTwin: f.id.replace("fence", "visualFence"), required: true, gap: f.gap || null }))
  };
}
export function parcelCollisionManifest(parcels = []) { return parcels.map(manifestForParcel); }
export function auditManifest(manifest = []) {
  const missing = manifest.filter(m => !m.house?.required || !m.gate?.required || !m.door?.required);
  const fenceWarnings = manifest.flatMap(m => (m.fences || []).filter(f => f.gap && !f.gap.gateId).map(f => ({ parcelId: m.parcelId, fenceId: f.id })));
  return { ok: missing.length === 0 && fenceWarnings.length === 0, missing, fenceWarnings, count: manifest.length };
}
export default { manifestForParcel, parcelCollisionManifest, auditManifest };
