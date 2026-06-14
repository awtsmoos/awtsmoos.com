// B"H
/**
 * @file LivingRegionRuntime.js
 * @description Chapter 1014: runtime summons only fresh complex trees and targetable wildlife.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { diagEvent } from "../../../../../utils/AwtsmoosDiagnostics.js?v=living-region-diag-20260612-bh1";
import { postWorkerProgress } from "../../../../oyved/core/protocol/WorkerProtocol.js";
import { buildRoadRenderer } from "./RegionRoadRenderer.js?v=proof-safe-roads-20260612-bh1";
import { buildGrassRenderer, buildWheatRenderer } from "./RegionGrassRenderer.js?v=ecology-render-20260612-bh1";
import { buildFlowerRenderer } from "./RegionFlowerRenderer.js?v=ecology-render-20260612-bh1";
import { buildBushRenderer } from "./RegionBushRenderer.js?v=quality-region-20260612-bh1";
import { buildRockRenderer } from "./RegionRockRenderer.js?v=ecology-render-20260612-bh1";
import { buildTreeRenderer } from "./RegionTreeRenderer.js?v=all-complex-leaf-card-trees-20260614-bh1";
import { buildFarmRenderer } from "./RegionFarmRenderer.js?v=quality-region-20260612-bh1";
import { buildLandmarkRenderer } from "./RegionLandmarkRenderer.js";
import { buildWildlifeRenderer, installWildlifeTicker } from "./RegionWildlifeRenderer.js?v=targetable-wildlife-20260614-bh1";
import { installRegionNpcRuntime } from "./RegionNpcRuntime.js?v=living-region-npc-runtime-20260612-bh1";
import { buildRegionColliderRuntime } from "./RegionColliderRuntime.js?v=merged-collider-20260612-bh1";
import { sealRegionVisual } from "./RegionSeal.js";
const KEY = "__awtsmoosLivingRegionRuntime";
const mark = (s, d = {}) => postWorkerProgress(`living-runtime:${s}`, d);
function collectStats(root, report) { const stats = { layers: root.children.length, meshes: 0, instancedMeshes: 0, instances: 0, pointLights: 0, reportSummary: report?.summary || null, kingdom: report?.kingdom?.summary || null }; root.traverse(o => { if (o.isMesh) stats.meshes++; if (o.isInstancedMesh) { stats.instancedMeshes++; stats.instances += o.count || 0; } if (o.isPointLight) stats.pointLights++; if (o.userData?.stats) Object.assign(stats, o.userData.stats); }); stats.performanceMode = stats.kingdom?.budget?.mode || report?.summary?.kingdomBudgetMode || "unknown"; stats.simulationTiers = stats.kingdom?.tiers || null; return stats; }
function announce(olam, stats) { diagEvent("living-region-runtime-ready", stats); try { olam?.ayshPeula?.("updateProgress", { livingRegionRuntimeStats: stats }); globalThis.postMessage?.({ type: "livingRegionRuntimeStats", payload: { stats } }); } catch (_) {} }
function addLayer(root, name, factory) { mark(`${name}:start`); const layer = factory(); root.add(layer); mark(`${name}:done`, { children: layer.children?.length || 0, count: layer.count || 0 }); return layer; }
export async function ensureLivingRegionRuntime(context = {}, report = {}) {
  const olam = context.olam || context, scene = context.scene || olam.scene; if (!scene || !olam) return null; if (olam[KEY]) return olam[KEY];
  mark("start", report.summary || {}); const root = new THREE.Group(); root.name = "AWTSMOOS_LIVING_REGION_REAL_RUNTIME_COMPLEX_TREE_TARGETS"; const roads = report.roads || {}; let wildlife = null;
  addLayer(root, "roads", () => buildRoadRenderer(olam, roads)); addLayer(root, "grass", () => buildGrassRenderer(olam, report)); addLayer(root, "wheat", () => buildWheatRenderer(olam, report)); addLayer(root, "flowers", () => buildFlowerRenderer(olam, roads, report)); addLayer(root, "bushes", () => buildBushRenderer(olam, report)); addLayer(root, "rocks", () => buildRockRenderer(olam, report)); addLayer(root, "trees", () => buildTreeRenderer(olam, report)); addLayer(root, "farms", () => buildFarmRenderer(olam, report)); addLayer(root, "landmarks", () => buildLandmarkRenderer(olam, report)); wildlife = addLayer(root, "wildlife", () => buildWildlifeRenderer(olam, report)); addLayer(root, "colliders", () => buildRegionColliderRuntime(olam, report));
  sealRegionVisual(root, { livingRegionRuntime: true, reportVersion: report.version, kingdomBudgetMode: report?.kingdom?.summary?.budget?.mode || "unknown" }); scene.add(root); mark("scene:add:done"); installWildlifeTicker(olam, wildlife); mark("wildlifeTicker:done"); const npcTicker = installRegionNpcRuntime(olam, report); mark("npcRuntime:done", { installed: Boolean(npcTicker) }); root.userData.stats = collectStats(root, report); root.userData.stats.npcTicker = Boolean(npcTicker); root.userData.stats.npcRuntime = olam.__livingRegionNpcRuntimeStats || null; olam[KEY] = root; olam.__AWTSMOOS_LIVING_REGION_STATS__ = root.userData.stats; announce(olam, root.userData.stats); mark("done", root.userData.stats); return root;
}
