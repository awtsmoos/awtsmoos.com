// B"H
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { finite } from "./GroundWorldMath.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const CACHEABLE_REAL_SOURCES = new Set(["mesh", "octree", "initial-raycast-grounding"]);

export function cachedHitValid(lastHit, x, z, epsilon) {
  if (!lastHit || lastHit.fallback || !CACHEABLE_REAL_SOURCES.has(lastHit.source)) return false;
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
