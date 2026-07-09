// B"H
/** @file WheatFieldLayer.js @description Wheat plans now derive from parcel gardens and farm plots. */
import { planParcels } from "../parcels/ParcelPlanner.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
export function wheatFieldLayer(options = {}) {
  const parcels = options.parcels || planParcels({ count: options.count || 16 });
  const wheatGardens = parcels.map(p => p.garden).filter(g => g?.crop === "wheat");
  return { count: 18000, rows: 42, wind: true, harvestStates: ["tilled", "planted", "young", "ripe", "cut", "separated"], plots: wheatGardens.map(g => ({ id: g.id, parcelId: g.parcelId, crop: "wheat", beds: g.beds })) };
}
export default { wheatFieldLayer };
