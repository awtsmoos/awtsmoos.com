// B"H
/** @file LivingRegionRuntime.js @description Player-first living region: colliders now, scenery later. */
import * as THREE from "/games/scripts/build/three.module.js";
import { postWorkerProgress } from "../../../../oyved/core/protocol/WorkerProtocol.js?v=no-alert-perf-jump-20260701-bh9";
import { buildRoadRenderer } from "./RegionRoadRenderer.js?v=road-cell-budget-20260622-bh1";
import { buildCottageRenderer } from "./RegionCottageRenderer.js?v=instanced-collider-cottage-walls-20260622-bh2";
import { buildRegionColliderRuntime } from "./RegionColliderRuntime.js?v=final-batch-colliders-20260615-bh1";
import { finalizeRegionColliderBatch } from "./RegionFinalColliderBatch.js?v=collider-source-reporting-20260615-bh2";
import { registerHouseRoot } from "../../collision/HouseCollisionWorld.js?v=ground-cache-diag-20260701-bh1";
import { installCollisionDiagnostics } from "../../collision/CollisionRuntime.js?v=ground-cache-diag-20260701-bh1";
import { updateZoneDiscovery } from "../../../../../systems/world/ZoneDiscoveryRuntime.js";
import { emitMapReveal } from "../../../../../systems/world/MapRevealRuntime.js";
import { startTutorial } from "../../../../../systems/tutorial/StartingExperienceRuntime.js";
import { sealRegionVisual } from "./RegionSeal.js";
import { attachColliderRealityAudit } from "../collision/ColliderRealityAudit.js?v=immense-collider-audit-20260615-bh1";
const KEY = "__awtsmoosLivingRegionRuntime";
const HEAVY = ["mountains", "grass", "wheat", "flowers", "bushes", "rocks", "trees", "water", "farms", "parcels", "landmarks", "wildlife", "battleLayer", "visualReality", "botanicalReality", "ecologyReality"];
function mark(stage, data = {}) { postWorkerProgress(`living-runtime:${stage}`, data); }
function addLayer(root, name, factory) { const t = performance.now(); mark(`${name}:start`); const layer = factory(); root.add(layer); mark(`${name}:done`, { elapsedMs:Math.round(performance.now() - t), children:layer.children?.length || 0, count:layer.count || 0, stats:layer.userData?.stats || null }); return layer; }
function skippedLayer(name, reason = "player-first-load") { const layer = new THREE.Group(); layer.name = `deferred_${name}_until_after_first_render`; layer.userData.stats = { skipped:true, deferred:true, reason }; return layer; }
function discoveryTicker(olam) { if (olam.__startingZoneDiscoveryTicker) return; let acc = 0; const ticker = { name:"starting_zone_discovery_map_ticker", type:"discoveryTicker", isReady:true, heesHawveh:true, heesHawvoos:dt => { acc += dt || 0; if (acc < 0.5) return; acc = 0; const found = updateZoneDiscovery(olam); if (found?.length) emitMapReveal(olam); } }; olam.__startingZoneDiscoveryTicker = ticker; if (Array.isArray(olam.nivrayim)) olam.nivrayim.push(ticker); }
function tutorialOnce(olam) { if (olam.__startingExperienceStarted) return; olam.__startingExperienceStarted = true; startTutorial(olam); }
function collectStats(root, report, timings) { const stats = { playerFirst:true, bh9:true, layers:root.children.length, meshes:0, instancedMeshes:0, instances:0, pointLights:0, timings, deferredHeavyLayers:HEAVY, reportSummary:report?.summary || null, fullWowScaleJewishGameplay:false, backgroundRuntimeTickersSkipped:true }; root.traverse(object => { if (object.isMesh) stats.meshes++; if (object.isInstancedMesh) { stats.instancedMeshes++; stats.instances += object.count || 0; } if (object.isPointLight) stats.pointLights++; }); return stats; }
function announce(olam, stats) { try { olam?.ayshPeula?.("updateProgress", { livingRegionRuntimeStats:stats }); globalThis.postMessage?.({ type:"livingRegionRuntimeStats", payload:{ stats } }); } catch (_) {} }
export async function ensureLivingRegionRuntime(context = {}, report = {}) {
  const started = performance.now(), timings = {}, olam = context.olam || context, scene = context.scene || olam?.scene;
  if (!scene || !olam) return null; if (olam[KEY]) return olam[KEY];
  installCollisionDiagnostics(olam); mark("start", { playerFirst:true, deferredHeavyLayers:HEAVY });
  const root = new THREE.Group(), roads = report.roads || {}; root.name = "AWTSMOOS_LIVING_REGION_PLAYER_FIRST_RUNTIME";
  HEAVY.forEach(name => root.add(skippedLayer(name)));
  const tRoad = performance.now(); addLayer(root, "roads", () => buildRoadRenderer(olam, roads)); timings.roadsMs = Math.round(performance.now() - tRoad);
  const tCottage = performance.now(); const cottages = addLayer(root, "cottages", () => buildCottageRenderer(olam, report)); timings.cottagesMs = Math.round(performance.now() - tCottage); olam.__livingRegionCottageRoot = cottages;
  const tColliders = performance.now(); addLayer(root, "colliders-authoring", () => buildRegionColliderRuntime(olam, report)); const colliderBatch = finalizeRegionColliderBatch(olam, root); timings.collidersMs = Math.round(performance.now() - tColliders);
  sealRegionVisual(root, { livingRegionRuntime:true, playerFirst:true, reportVersion:report.version, cottages:true, mountains:false, fullGameplay:false });
  scene.add(root); root.updateMatrixWorld(true); registerHouseRoot(olam, cottages, { houseId:"living-region-cottages" });
  const colliderRealityAudit = attachColliderRealityAudit(root); discoveryTicker(olam); tutorialOnce(olam);
  root.userData.stats = collectStats(root, report, { ...timings, totalMs:Math.round(performance.now() - started) });
  Object.assign(root.userData.stats, { finalColliderBatch:colliderBatch, colliderRealityAudit, houseCollisionWorld:olam.__awtsmoosHouseCollisionWorld?.diag?.() || null, collisionAuthority:globalThis.__AWTS_COLLISION_DIAG__?.() || null, npcTicker:false, discoveryTicker:Boolean(olam.__startingZoneDiscoveryTicker), npcRuntime:null, opaqueAnimalRealism:false, realisticGaits:false, cottageBrickSystem:true, liveDoors:true, cottage2Split:true });
  olam[KEY] = root; olam.__AWTSMOOS_LIVING_REGION_STATS__ = root.userData.stats; announce(olam, root.userData.stats); mark("done", root.userData.stats); return root;
}
