// B"H
import * as THREE from "/games/scripts/build/three.module.js";
import { finite } from "./GroundWorldMath.js";

/**
 * Purpose: cache, fallback, and diagnostics records for ground hits.
 * Owner: GroundCollisionWorld.
 * Inputs: hit records, fallback functions, and olam diagnostics object.
 * Outputs: normalized lastHit records and reports.
 * Runtime authority: owns no transforms, only measurement records.
 * Performance: same-position cache avoids repeated raycasts.
 * Update order: invoked after mesh query attempt.
 * Callers: GroundCollisionWorld.groundAt and diag.
 * Calls: fallbackFn when no mesh proof exists.
 * Invariants: fallback records are explicitly marked fallback:true.
 * Failure modes: invalid fallback values collapse to fallback argument.
 * Future: add histogram of fallback reasons.
 */
export function cachedHitValid(lastHit, x, z, epsilon) {
  if (!lastHit || lastHit.fallback || lastHit.source !== "mesh") return false;
  return Math.abs(finite(x) - lastHit.x) <= epsilon && Math.abs(finite(z) - lastHit.z) <= epsilon;
}

export function publishReport(olam, lastHit, fallbackUsed) {
  if (!olam) return;
  olam.__awtsmoosGroundCollisionReport = {
    ...(olam.__awtsmoosGroundCollisionReport || {}), last:lastHit, fallbackUsed
  };
}

export function fallbackHit(olam, x, z, fallback, options, reason) {
  const value = typeof options.fallbackFn === "function" ? options.fallbackFn(x, z, fallback) : fallback;
  const y = finite(value, fallback);
  const lastHit = {
    x:finite(x), z:finite(z), y, point:new THREE.Vector3(finite(x), y, finite(z)),
    normal:new THREE.Vector3(0, 1, 0), distance:0, source:"fallback", fallback:true,
    reason, mesh:null, meshUuid:null, triangleId:null, object:null
  };
  publishReport(olam, lastHit, true);
  return lastHit;
}

export function diagPayload(world) {
  const hit = world.lastHit;
  return {
    terrainMeshes:world.meshes.size,
    lastHit:hit ? {
      x:hit.x, z:hit.z, y:hit.y, distance:hit.distance, source:hit.source,
      fallback:hit.fallback, reason:hit.reason || null, mesh:hit.mesh || null,
      meshUuid:hit.meshUuid || null, triangleId:hit.triangleId,
      normal:hit.normal ? { x:hit.normal.x, y:hit.normal.y, z:hit.normal.z } : null
    } : null,
    fallbackUsed:world.fallbackUsed,
    cacheHits:world.cacheHits,
    fullSceneTraversalsAvoided:world.fullSceneTraversalsAvoided,
    index:world.index.diag()
  };
}
