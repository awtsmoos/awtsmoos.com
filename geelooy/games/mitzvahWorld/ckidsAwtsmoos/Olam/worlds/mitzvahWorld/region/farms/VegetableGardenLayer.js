// B"H
/** @file VegetableGardenLayer.js @description Vegetable/herb/orchard beds from parcel gardens. */
import { planParcels } from "../parcels/ParcelPlanner.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
export function vegetableGardenLayer(options = {}) {
  const parcels = options.parcels || planParcels({ count: options.count || 16 });
  const gardens = parcels.map(p => p.garden).filter(g => g?.crop !== "wheat");
  return { beds: gardens.reduce((n, g) => n + (g.beds?.length || 0), 0), crops: ["carrotSkin", "potatoSkin", "onionSkin", "cabbageLeaf", "herb", "orchard"], props: ["crate", "barrel", "wateringCan"], plots: gardens };
}
export default { vegetableGardenLayer };
