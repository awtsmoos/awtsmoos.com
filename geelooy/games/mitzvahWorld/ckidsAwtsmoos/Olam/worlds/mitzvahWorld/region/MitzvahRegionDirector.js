// B"H
/** @file MitzvahRegionDirector.js @description Orchestrates the living region stack after the base world is born. */
import { REGION_PHASES, phaseReport } from './RegionPhases.js';
import { buildMacroTerrainRecipe } from './terrain/MacroTerrainRecipe.js';
import { buildBiomePlan } from './biomes/BiomeDirector.js';
import { buildRoadNetwork } from './roads/RoadNetwork.js';
import { buildInstancePlan } from './instances/InstancePool.js';
import { buildWildlifePlan } from './wildlife/WildlifeDirector.js';
import { buildNpcSchedulePlan } from './npc/NpcScheduleDirector.js';
import { buildHousePlan } from './houses/HousePlanner.js';
import { classifyRegionColliders } from './collision/ColliderClassifier.js';
import { buildRegionReport } from './debug/RegionBuildReport.js';
const KEY='__awtsmoosMitzvahRegionDirectorReport';
export async function ensureMitzvahRegionDirector(context={}){const olam=context.olam||context;if(!olam||olam[KEY])return olam?.[KEY]||null;const terrain=buildMacroTerrainRecipe(context), biomes=buildBiomePlan(context), roads=buildRoadNetwork(context), houses=buildHousePlan(context);const instances=buildInstancePlan({terrain,biomes,roads,houses});const wildlife=buildWildlifePlan({terrain,biomes,roads});const npcSchedules=buildNpcSchedulePlan({roads,houses});const colliders=classifyRegionColliders({houses,roads,instances});const report=buildRegionReport({terrain,biomes,roads,houses,instances,wildlife,npcSchedules,colliders,phases:REGION_PHASES.map(p=>phaseReport(p,true))});olam[KEY]=report;return report;}
