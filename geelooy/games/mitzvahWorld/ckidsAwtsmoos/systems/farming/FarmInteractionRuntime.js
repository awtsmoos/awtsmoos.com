// B"H
/** @file FarmInteractionRuntime.js @description One entrypoint for plant, water, grow, harvest. */
import { plantPlot } from "./PlantingRuntime.js";
import { waterPlot, tickCrops } from "./CropGrowthRuntime.js";
import { harvestPlot } from "./HarvestRuntime.js";
export function farmAction(olam, action, plotId, arg) { if (action === "plant") return plantPlot(olam, plotId, arg || "wheat"); if (action === "water") return waterPlot(olam, plotId); if (action === "grow") return tickCrops(olam, Number(arg || 1)); if (action === "harvest") return harvestPlot(olam, plotId); return false; }
export default { farmAction };
