// B"H
/**
 * @file LivingRegionRuntime.js
 * @description Split living region runtime: cottages collide, wildlife breathes,
 * friendly NPCs stand in the default scene, and every subsystem has its vessel.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { buildRoadRenderer } from "./RegionRoadRenderer.js?v=road-cell-budget-20260622-bh1";
import { buildCottageRenderer } from "./RegionCottageRenderer.js?v=perf-tight-collision-20260703-bh2";
import { installCollisionDiagnostics } from "../../collision/CollisionRuntime.js?v=perf-tight-collision-20260703-bh2";
import { updateZoneDiscovery } from "../../../../../systems/world/ZoneDiscoveryRuntime.js";
import { emitMapReveal } from "../../../../../systems/world/MapRevealRuntime.js";
import { startTutorial } from "../../../../../systems/tutorial/StartingExperienceRuntime.js";
import { sealRegionVisual } from "./RegionSeal.js";
import { attachColliderRealityAudit } from "../collision/ColliderRealityAudit.js?v=immense-collider-audit-20260615-bh1";
import { addLayer, skippedLayer, DEFERRED_LAYERS, markLiving } from "./living/LivingRegionLayers.js?v=perf-tight-collision-20260703-bh2";
import { addFriendlyNpcs, addWildlifeLayer } from "./living/LivingRegionActors.js?v=perf-tight-collision-20260703-bh3";
import { addFinalCollision, registerPlacedCottages } from "./living/LivingRegionCollision.js?v=perf-tight-collision-20260703-bh2";
import { collectLivingStats, announceLivingStats } from "./living/LivingRegionStats.js?v=perf-tight-collision-20260703-bh2";

const KEY = "__awtsmoosLivingRegionRuntime";

function discoveryTicker(olam) {
  if (olam.__startingZoneDiscoveryTicker) return;
  let acc = 0;
  const ticker = { name:"starting_zone_discovery_map_ticker", type:"discoveryTicker", isReady:true, heesHawveh:true,
    heesHawvoos:dt => { acc += dt || 0; if (acc < .5) return; acc = 0; const found = updateZoneDiscovery(olam); if (found?.length) emitMapReveal(olam); } };
  olam.__startingZoneDiscoveryTicker = ticker;
  if (Array.isArray(olam.nivrayim)) olam.nivrayim.push(ticker);
}

function tutorialOnce(olam) {
  if (olam.__startingExperienceStarted) return;
  olam.__startingExperienceStarted = true;
  startTutorial(olam);
}

export async function ensureLivingRegionRuntime(context = {}, report = {}) {
  const started = performance.now(), timings = {}, olam = context.olam || context, scene = context.scene || olam?.scene;
  if (!scene || !olam) return null;
  if (olam[KEY]) return olam[KEY];
  installCollisionDiagnostics(olam);
  markLiving("start", { playerFirst:true, wildlifeDeferred:true, npcEarly:true });
  const root = new THREE.Group();
  root.name = "AWTSMOOS_LIVING_REGION_PLAYER_FIRST_RUNTIME";
  DEFERRED_LAYERS.forEach(name => root.add(skippedLayer(name)));
  const tRoad = performance.now(); addLayer(root, "roads", () => buildRoadRenderer(olam, report.roads || {})); timings.roadsMs = Math.round(performance.now() - tRoad);
  const tCottage = performance.now(); const cottages = addLayer(root, "cottages", () => buildCottageRenderer(olam, report)); timings.cottagesMs = Math.round(performance.now() - tCottage);
  const tWild = performance.now(); const wildlifeInfo = addWildlifeLayer(root, olam, report); timings.wildlifeMs = Math.round(performance.now() - tWild);
  sealRegionVisual(root, { livingRegionRuntime:true, playerFirst:true, reportVersion:report.version, cottages:true, wildlifeDeferred:true, friendlyNpcs:true });
  scene.add(root); root.updateMatrixWorld(true);
  const tColliders = performance.now(); const colliderBatch = addFinalCollision(root, olam, report); const house = registerPlacedCottages(olam, cottages); timings.collidersMs = Math.round(performance.now() - tColliders);
  const tNpc = performance.now(); const npcInfo = await addFriendlyNpcs(olam, scene, report); timings.npcMs = Math.round(performance.now() - tNpc);
  discoveryTicker(olam); tutorialOnce(olam);
  const colliderRealityAudit = attachColliderRealityAudit(root);
  root.userData.stats = collectLivingStats(root, report, { ...timings, totalMs:Math.round(performance.now() - started) });
  Object.assign(root.userData.stats, { finalColliderBatch:colliderBatch, colliderRealityAudit, houseCollisionWorld:olam.__awtsmoosHouseCollisionWorld?.diag?.() || null, collisionAuthority:globalThis.__AWTS_COLLISION_DIAG__?.() || null, npcTicker:Boolean(npcInfo.ticker), npcRuntime:npcInfo, wildlifeRuntime:wildlifeInfo, wildlifeCount:wildlifeInfo.count, friendlyNpcCount:npcInfo.count, houseColliderRecords:house?.records?.length || 0, opaqueAnimalRealism:true, realisticGaits:true, cottageBrickSystem:true, liveDoors:true });
  olam[KEY] = root; olam.__AWTSMOOS_LIVING_REGION_STATS__ = root.userData.stats;
  announceLivingStats(olam, root.userData.stats); markLiving("done", root.userData.stats);
  return root;
}
