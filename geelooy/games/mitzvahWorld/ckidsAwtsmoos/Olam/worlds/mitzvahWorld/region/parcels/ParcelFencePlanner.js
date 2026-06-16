// B"H
/** @file ParcelFencePlanner.js @description Fences every parcel with an honest gate gap. */
function seg(id, a, b, extra = {}) { return { id, start: a, end: b, height: 1.25, thickness: 0.28, style: "splitRail", ...extra }; }
export function fenceForParcel(parcel, gate = parcel.gate) {
  const hw = parcel.yard.width / 2, hd = parcel.yard.depth / 2, x = parcel.x, z = parcel.z;
  const minX = x - hw, maxX = x + hw, minZ = z - hd, maxZ = z + hd;
  const gap = gate ? { centerX: gate.x, width: gate.width, gateId: gate.id } : null;
  return [
    seg(`${parcel.id}_fence_back`, { x: minX, z: minZ }, { x: maxX, z: minZ }),
    seg(`${parcel.id}_fence_left`, { x: minX, z: minZ }, { x: minX, z: maxZ }),
    seg(`${parcel.id}_fence_right`, { x: maxX, z: minZ }, { x: maxX, z: maxZ }),
    seg(`${parcel.id}_fence_front`, { x: minX, z: maxZ }, { x: maxX, z: maxZ }, { gap })
  ];
}
export function planFences(parcels = []) { return parcels.flatMap(p => fenceForParcel(p, p.gate)); }
export default { fenceForParcel, planFences };
