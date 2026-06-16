// B"H
/** @file FarmInventoryRuntime.js @description Moves harvested produce into the player's bag as tevel. */
import { addBagItem } from "../inventory/BagRuntime.js";
export function produceItem(crop = "wheat", bundles = 1, sourcePlotId = "") { return { id: `tevel_${crop}_bundle_${sourcePlotId || Date.now()}`, baseId: `tevel_${crop}_bundle`, name: `Tevel ${crop} bundle`, category: "Materials", icon: "🌾", quantity: bundles, produceStatus: { crop, tevel: true, separated: false, sourcePlotId } }; }
export function addHarvestToBag(olam, crop, bundles, sourcePlotId) { const item = produceItem(crop, bundles, sourcePlotId); addBagItem(olam, item); return item; }
export default { produceItem, addHarvestToBag };
