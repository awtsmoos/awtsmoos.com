// B"H
/** @file ParcelGatePlanner.js @description Plans lockable gates at road-facing fence gaps. */
export function gateForParcel(parcel) {
  const width = parcel.gateWidth || 2.4;
  const z = parcel.z + parcel.yard.depth / 2;
  return { id: `${parcel.id}_gate`, parcelId: parcel.id, lockId: `${parcel.id}_gate_lock`, keyId: parcel.keyId || "village_master_key", locked: parcel.locked !== false, width, height: 1.25, thickness: 0.22, x: parcel.x, z, yaw: parcel.yaw || 0 };
}
export function planGates(parcels = []) { return parcels.map(gateForParcel); }
export default { gateForParcel, planGates };
