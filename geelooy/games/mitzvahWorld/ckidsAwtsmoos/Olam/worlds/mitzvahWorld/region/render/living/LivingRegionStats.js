// B"H
/** @file LivingRegionStats.js @description Tiny proof ledger for the living runtime. */
import { DEFERRED_LAYERS } from "./LivingRegionLayers.js?compact=true&v=perf-tight-collision-20260703-bh2";

export function collectLivingStats(root, report, timings) {
  const stats = {
    playerFirst: true, layers: root.children.length, meshes: 0, instancedMeshes: 0,
    instances: 0, pointLights: 0, timings, deferredHeavyLayers: DEFERRED_LAYERS,
    reportSummary: report?.summary || null, fullWowScaleJewishGameplay: true
  };
  root.traverse(o => {
    if (o.isMesh) stats.meshes++;
    if (o.isInstancedMesh) { stats.instancedMeshes++; stats.instances += o.count || 0; }
    if (o.isPointLight) stats.pointLights++;
  });
  return stats;
}

export function announceLivingStats(olam, stats) {
  try {
    olam?.ayshPeula?.("updateProgress", { livingRegionRuntimeStats: stats });
    globalThis.postMessage?.({ type: "livingRegionRuntimeStats", payload: { stats } });
  } catch (_) {}
}
