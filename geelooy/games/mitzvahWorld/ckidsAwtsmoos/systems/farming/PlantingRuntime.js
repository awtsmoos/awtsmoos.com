// B"H
/** @file PlantingRuntime.js @description Plant seeds into parcel gardens with farming XP and shlichus progress. */
import { ensureFarmState, emitFarm } from "./FarmPlotRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { progressActiveObjectives } from "../missions/MissionObjectiveRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { grantProfessionXp } from "../professions/ProfessionRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function plantPlot(olam, plotId, crop = "wheat") { const p = ensureFarmState(olam).plots[plotId]; if (!p) return false; if (p.state !== "tilled" && p.state !== "cut") return false; p.crop = crop; p.state = "planted"; p.growth = 0.05; p.mitzvahStatus = { tevel:false, separated:false }; grantProfessionXp(olam, "farming", 3); progressActiveObjectives(olam, "plant", 1); olam?.ayshPeula?.("ui event", "effectsOverlay", { text:`Planted ${crop}`, color:"#76ff8a" }); emitFarm(olam); return p; }
export default { plantPlot };
