// B"H
/**
 * @file MitzvahRegionDirector.js
 * @description The region report is born once, cached, compacted, and handed to the living runtime.
 */
import { REGION_PHASES, phaseReport } from "./RegionPhases.js";
import { buildMacroTerrainRecipe } from "./terrain/MacroTerrainRecipe.js?v=awtsmoos-macro-terrain-20260614-bh2";
import { buildBiomePlan } from "./biomes/BiomeDirector.js?v=awtsmoos-biome-plan-20260614-bh2";
import { buildRoadNetwork } from "./roads/RoadNetwork.js?v=awtsmoos-road-network-20260614-bh2";
import { buildEcologyGrid } from "./ecology/EcologyGrid.js?v=awtsmoos-ecology-grid-20260614-bh2";
import { buildInstancePlan } from "./instances/InstancePool.js?v=awtsmoos-instance-plan-20260614-bh2";
import { buildWildlifePlan } from "./wildlife/WildlifeDirector.js?v=awtsmoos-wildlife-director-20260614-bh2";
import { buildNpcSchedulePlan } from "./npc/NpcScheduleDirector.js?v=awtsmoos-npc-schedule-20260614-bh2";
import { buildHousePlan } from "./houses/HousePlanner.js?v=awtsmoos-house-plan-20260614-bh2";
import { classifyRegionColliders } from "./collision/ColliderClassifier.js?v=awtsmoos-collider-classifier-20260614-bh2";
import { buildKingdomGardenKernel } from "./kingdom/KingdomGardenKernel.js?v=awtsmoos-kingdom-kernel-20260614-bh2";
import { buildRegionReport } from "./debug/RegionBuildReport.js?v=awtsmoos-region-report-20260614-bh2";
const KEY = "__awtsmoosMitzvahRegionDirectorReport";
const BOUNDS = Object.freeze({ minX:-330, maxX:330, minZ:-200, maxZ:200 });
function safe(value, fallback = {}) { return value || fallback; }
function summaryOf(report) { return report && report.summary ? report.summary : null; }
function compactReport(report) { const kingdom = report && report.kingdom ? report.kingdom : {}; const ecology = report && report.ecology ? report.ecology : {}; const roads = report && report.roads ? report.roads : {}; return { ok:report ? report.ok : false, version:report ? report.version : null, summary:summaryOf(report), kingdom:kingdom.summary || null, ecology:ecology.summary || null, roads:roads.version || null }; }
function postDirectorReport(report) { try { if (typeof globalThis !== "undefined" && typeof globalThis.postMessage === "function") globalThis.postMessage({ type:"livingRegionDirectorReport", payload:{ report:compactReport(report) } }); } catch (_) {} }
function buildPhases() { return REGION_PHASES.map(phase => phaseReport(phase, true)); }
export async function ensureMitzvahRegionDirector(context = {}) {
  const olam = context.olam || context; if (!olam) return null; if (olam[KEY]) return olam[KEY];
  const terrain = Object.assign({}, buildMacroTerrainRecipe(context), { bounds:BOUNDS });
  const biomes = buildBiomePlan({ terrain });
  const roads = buildRoadNetwork({ terrain, biomes });
  const ecology = buildEcologyGrid({ terrain, biomes, roads, spacing:10 });
  const houses = buildHousePlan({ terrain, biomes, roads, ecology });
  const instances = buildInstancePlan({ terrain, biomes, roads, houses, ecology });
  const wildlife = buildWildlifePlan({ terrain, biomes, roads, ecology, instances });
  const npcSchedules = buildNpcSchedulePlan({ roads, houses, biomes });
  const colliders = classifyRegionColliders({ houses, roads, instances, ecology });
  const phases = buildPhases();
  const kingdom = buildKingdomGardenKernel({ terrain, biomes, roads, ecology, houses, instances, wildlife, npcSchedules, colliders, phases });
  const report = buildRegionReport({ terrain, biomes, roads, ecology, houses, instances, wildlife, npcSchedules, colliders, phases, kingdom });
  olam[KEY] = report; olam.__AWTSMOOS_LIVING_REGION_REPORT__ = report; postDirectorReport(report); return safe(report, null);
}
