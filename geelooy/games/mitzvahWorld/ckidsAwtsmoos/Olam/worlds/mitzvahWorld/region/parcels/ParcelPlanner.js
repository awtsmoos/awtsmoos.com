// B"H
/**
 * @file ParcelPlanner.js
 * @description Generates the village as parcels: house, yard, gate, fence,
 * garden, owner. The Awtsmoos hides order inside the road, not randomness.
 */
import { ownerRecord, OWNER_ROLES } from "./ParcelOwnership.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { gateForParcel } from "./ParcelGatePlanner.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { fenceForParcel } from "./ParcelFencePlanner.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { gardenForParcel } from "./ParcelGardenPlanner.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const BASE_ROLES = ["farmer", "baker", "kohenTeacher", "leviTeacher", "poorFamily", "melamed", "scribe", "shepherd", "toolmaker", "innkeeper", "orchardKeeper", "beekeeper", "sofer", "grocer", "farmer", "poorFamily"];
function n(v, f = 0) { return Number.isFinite(Number(v)) ? Number(v) : f; }
function roleAt(i) { return BASE_ROLES[i % BASE_ROLES.length] || OWNER_ROLES[i % OWNER_ROLES.length]; }
export function createParcel(role, index, options = {}) {
  const ring = Math.floor(index / 8), side = index % 8, angle = side / 8 * Math.PI * 2;
  const radius = n(options.radius, 42) + ring * 18;
  const x = Math.round(Math.cos(angle) * radius), z = Math.round(Math.sin(angle) * radius);
  const owner = ownerRecord(role, index + 1);
  const yard = { width: role === "farmer" ? 20 : 14, depth: role === "farmer" ? 28 : 18, frontBuffer: 5, backBuffer: 9, sideBuffer: 4 };
  const parcel = { id: `parcel_${role}_${index + 1}`, role, owner, ownerNpcId: owner.npcId, houseId: `house_${role}_${index + 1}`, x, z, yaw: angle + Math.PI, yard, keyId: `${role}_key`, locked: role !== "poorFamily", quality: options.quality || "medium" };
  parcel.gate = gateForParcel(parcel); parcel.fences = fenceForParcel(parcel, parcel.gate); parcel.garden = gardenForParcel(parcel);
  return parcel;
}
export function planParcels(options = {}) {
  const count = Math.max(10, Math.min(24, n(options.count, 16)));
  return Array.from({ length: count }, (_, i) => createParcel(roleAt(i), i, options));
}
export default { planParcels, createParcel };
