// B"H
/** @file ParcelGardenPlanner.js @description Adds farm/garden buffers to every parcel. */
const CROP_BY_ROLE = Object.freeze({ farmer: "wheat", baker: "wheat", poorFamily: "vegetable", orchardKeeper: "orchard", beekeeper: "herb", kohenTeacher: "herb", leviTeacher: "vegetable" });
export function gardenForParcel(parcel) {
  const crop = CROP_BY_ROLE[parcel.role] || "vegetable";
  const bedCount = crop === "wheat" ? 4 : crop === "orchard" ? 6 : 3;
  const beds = Array.from({ length: bedCount }, (_, i) => ({ id: `${parcel.id}_bed_${i + 1}`, crop, x: parcel.x - parcel.yard.width * 0.25 + i * 1.8, z: parcel.z - parcel.yard.depth * 0.22, state: "tilled", growth: 0 }));
  return { id: `${parcel.id}_garden`, parcelId: parcel.id, crop, beds };
}
export function planGardens(parcels = []) { return parcels.map(gardenForParcel); }
export default { gardenForParcel, planGardens };
