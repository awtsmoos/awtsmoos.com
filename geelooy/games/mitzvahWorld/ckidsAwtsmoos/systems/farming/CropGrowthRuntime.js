// B"H
/** @file CropGrowthRuntime.js @description Growth ticks for wheat, herbs, vegetables, and orchard beds. */
import { ensureFarmState, emitFarm } from "./FarmPlotRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { progressActiveObjectives } from "../missions/MissionObjectiveRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function tickCrops(olam, dt = 1) { const state = ensureFarmState(olam); for (const p of Object.values(state.plots)) { if (p.state === "planted" || p.state === "young") { p.growth = Math.min(1, p.growth + dt * 0.01 * (1 + p.water)); p.state = p.growth >= 1 ? "ripe" : "young"; } } return emitFarm(olam); }
export function waterPlot(olam, plotId) { const p = ensureFarmState(olam).plots[plotId]; if (!p) return false; p.water = Math.min(3, (p.water || 0) + 1); progressActiveObjectives(olam, "water", 1); olam?.ayshPeula?.("ui event", "cropState", { plotId, state:p.state, water:p.water }); return p; }
export default { tickCrops, waterPlot };
