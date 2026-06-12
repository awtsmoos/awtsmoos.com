// B"H
/**
 * @file LivingRegionRuntime.js
 * @description Chapter 971: assembled living region runtime with measured stats, wildlife, and NPC ticks.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { diagEvent } from "../../../../../utils/AwtsmoosDiagnostics.js?v=living-region-diag-20260612-bh1";
import { buildRoadRenderer } from "./RegionRoadRenderer.js";
import { buildGrassRenderer, buildWheatRenderer } from "./RegionGrassRenderer.js?v=quality-region-20260612-bh1";
import { buildFlowerRenderer } from "./RegionFlowerRenderer.js?v=quality-region-20260612-bh1";
import { buildBushRenderer } from "./RegionBushRenderer.js?v=quality-region-20260612-bh1";
import { buildRockRenderer } from "./RegionRockRenderer.js?v=quality-region-20260612-bh1";
import { buildTreeRenderer } from "./RegionTreeRenderer.js?v=quality-region-20260612-bh1";
import { buildFarmRenderer } from "./RegionFarmRenderer.js?v=quality-region-20260612-bh1";
import { buildLandmarkRenderer } from "./RegionLandmarkRenderer.js";
import { buildWildlifeRenderer, installWildlifeTicker } from "./RegionWildlifeRenderer.js?v=living-region-wildlife-ticker-20260612-bh1";
import { installRegionNpcRuntime } from "./RegionNpcRuntime.js?v=living-region-npc-runtime-20260612-bh1";
import { buildRegionColliderRuntime } from "./RegionColliderRuntime.js?v=merged-collider-20260612-bh1";
import { sealRegionVisual } from "./RegionSeal.js";
const KEY = "__awtsmoosLivingRegionRuntime";
function collectStats(root) {
  const stats = { layers: root.children.length, meshes: 0, instancedMeshes: 0, instances: 0, pointLights: 0 };
  root.traverse(o => { if (o.isMesh) stats.meshes++; if (o.isInstancedMesh) { stats.instancedMeshes++; stats.instances += o.count || 0; } if (o.isPointLight) stats.pointLights++; if (o.userData?.stats) Object.assign(stats, o.userData.stats); });
  return stats;
}
function announce(olam, stats) { diagEvent("living-region-runtime-ready", stats); console.info("B\"H | LIVING_REGION_RUNTIME_READY", stats); try { olam?.ayshPeula?.("updateProgress", { livingRegionRuntimeStats: stats }); globalThis.postMessage?.({ type: "livingRegionRuntimeStats", payload: { stats } }); } catch {} }
export async function ensureLivingRegionRuntime(context = {}, report = {}) {
  const olam = context.olam || context, scene = context.scene || olam.scene;
  if (!scene || !olam) return null; if (olam[KEY]) return olam[KEY];
  const root = new THREE.Group(); root.name = "AWTSMOOS_LIVING_REGION_REAL_RUNTIME";
  const roads = report.roads || { main: { points: [[-145, -42], [-90, -8], [-25, 8], [45, 22], [135, 72]] }, farm: { points: [[-40, 5], [-100, -25], [-155, -45]] } };
  const wildlife = buildWildlifeRenderer(olam);
  const layers = [buildRoadRenderer(olam, roads), buildGrassRenderer(olam), buildWheatRenderer(olam), buildFlowerRenderer(olam, roads), buildBushRenderer(olam), buildRockRenderer(olam), buildTreeRenderer(olam), buildFarmRenderer(olam), buildLandmarkRenderer(olam), wildlife, buildRegionColliderRuntime(olam, report)];
  for (const layer of layers) root.add(layer);
  sealRegionVisual(root, { livingRegionRuntime: true }); scene.add(root); installWildlifeTicker(olam, wildlife); const npcTicker = installRegionNpcRuntime(olam);
  root.userData.stats = collectStats(root); root.userData.stats.npcTicker = Boolean(npcTicker); root.userData.stats.npcRuntime = olam.__livingRegionNpcRuntimeStats || null;
  olam[KEY] = root; olam.__AWTSMOOS_LIVING_REGION_STATS__ = root.userData.stats; announce(olam, root.userData.stats); return root;
}




