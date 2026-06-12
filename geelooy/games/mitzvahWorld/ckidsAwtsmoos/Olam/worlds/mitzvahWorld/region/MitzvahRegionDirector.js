// B"H
/**
 * @file MitzvahRegionDirector.js
 * @description Chapter 1012: the living region now crowns itself with a kingdom kernel.
 */
import { REGION_PHASES, phaseReport } from "./RegionPhases.js";
import { buildMacroTerrainRecipe } from "./terrain/MacroTerrainRecipe.js";
import { buildBiomePlan } from "./biomes/BiomeDirector.js";
import { buildRoadNetwork } from "./roads/RoadNetwork.js";
import { buildEcologyGrid } from "./ecology/EcologyGrid.js";
import { buildInstancePlan } from "./instances/InstancePool.js";
import { buildWildlifePlan } from "./wildlife/WildlifeDirector.js";
import { buildNpcSchedulePlan } from "./npc/NpcScheduleDirector.js";
import { buildHousePlan } from "./houses/HousePlanner.js";
import { classifyRegionColliders } from "./collision/ColliderClassifier.js";
import { buildKingdomGardenKernel } from "./kingdom/KingdomGardenKernel.js";
import { buildRegionReport } from "./debug/RegionBuildReport.js";

const KEY = "__awtsmoosMitzvahRegionDirectorReport";
const BOUNDS = Object.freeze({ minX: -330, maxX: 330, minZ: -200, maxZ: 200 });

function postDirectorReport(report) {
  try { globalThis.postMessage?.({ type: "livingRegionDirectorReport", payload: { report: compactReport(report) } }); }
  catch (_) {}
}

function compactReport(report) {
  return { ok: report?.ok, version: report?.version, summary: report?.summary, kingdom: report?.kingdom?.summary, ecology: report?.ecology?.summary, roads: report?.roads?.version };
}

export async function ensureMitzvahRegionDirector(context = {}) {
  const olam = context.olam || context;
  if (!olam) return null;
  if (olam[KEY]) return olam[KEY];

  const terrain = { ...buildMacroTerrainRecipe(context), bounds: BOUNDS };
  const biomes = buildBiomePlan({ terrain });
  const roads = buildRoadNetwork({ terrain, biomes });
  const ecology = buildEcologyGrid({ terrain, biomes, roads, spacing: 10 });
  const houses = buildHousePlan({ terrain, biomes, roads, ecology });
  const instances = buildInstancePlan({ terrain, biomes, roads, houses, ecology });
  const wildlife = buildWildlifePlan({ terrain, biomes, roads, ecology, instances });
  const npcSchedules = buildNpcSchedulePlan({ roads, houses, biomes });
  const colliders = classifyRegionColliders({ houses, roads, instances, ecology });
  const phases = REGION_PHASES.map(p => phaseReport(p, true));
  const kingdom = buildKingdomGardenKernel({ terrain, biomes, roads, ecology, houses, instances, wildlife, npcSchedules, colliders, phases });
  const report = buildRegionReport({ terrain, biomes, roads, ecology, houses, instances, wildlife, npcSchedules, colliders, phases, kingdom });

  olam[KEY] = report;
  olam.__AWTSMOOS_LIVING_REGION_REPORT__ = report;
  postDirectorReport(report);
  return report;
}
