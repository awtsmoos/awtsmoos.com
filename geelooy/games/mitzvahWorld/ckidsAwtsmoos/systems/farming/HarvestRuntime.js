// B"H
/** @file HarvestRuntime.js @description Harvest ripe crops into tevel produce, profession XP, and mission progress. */
import { ensureFarmState, emitFarm } from "./FarmPlotRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { addHarvestToBag } from "./FarmInventoryRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { progressActiveObjectives } from "../missions/MissionObjectiveRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { grantProfessionXp } from "../professions/ProfessionRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function harvestPlot(olam, plotId) { const p = ensureFarmState(olam).plots[plotId]; if (!p || p.state !== "ripe") return false; const bundles = Math.max(1, p.beds?.length || 1); p.state = "cut"; p.yield = { bundles }; p.mitzvahStatus = { tevel:true, separated:false }; addHarvestToBag(olam, p.crop, bundles, plotId); grantProfessionXp(olam, "farming", 8 * bundles); progressActiveObjectives(olam, "harvest", 1); olam?.ayshPeula?.("ui event", "effectsOverlay", { text:`Harvested ${bundles} ${p.crop}`, color:"#ffd966" }); emitFarm(olam); return p; }
export default { harvestPlot };
