// B"H
import * as THREE from "/games/scripts/build/three.module.js";
import SpatialBubbleIndex from "./SpatialBubbleIndex.js";
import { DOWN, NORMAL_MATRIX, RAYCASTER, finite } from "./groundWorld/GroundWorldMath.js";
import { terrainRecord } from "./groundWorld/GroundTerrainRegistry.js";
import { cachedHitValid, diagPayload, fallbackHit, publishReport } from "./groundWorld/GroundHitCache.js";
import { surfaceIdentity } from "./groundWorld/GroundSurfaceIdentity.js";

/**
 * Mesh-ground authority queried by player collision.
 * Owner: CollisionRuntime and PlayerCollisionBubble.
 * Inputs: registered terrain meshes plus x/z queries.
 * Outputs: real ray hits with point, normal, surface, material, walkability.
 * Runtime authority: owns ground-hit measurement, never player transforms.
 * Update order: terrain registers during load, then player queries per frame.
 * Invariants: fallback use is explicit and diagnostic-visible.
 * Failure modes: no mesh hit returns fallback:true with reason.
 */
export default class GroundCollisionWorld {
  constructor(olam, options = {}) {
    this.olam = olam || null;
    this.index = options.index || new SpatialBubbleIndex({ cellSize:options.cellSize || 24 });
    this.meshes = new Map(); this.lastHit = null; this.fallbackUsed = 0;
    this.cacheHits = 0; this.fullSceneTraversalsAvoided = 0;
    this.queryRadius = Math.max(4, finite(options.queryRadius, 28));
    this.cacheEpsilon = Math.max(0.005, finite(options.cacheEpsilon, 0.04));
  }
  registerTerrainMesh(mesh, options = {}) { return terrainRecord(this.index, this.meshes, mesh, options); }
  registerKnownTerrainMeshes(meshes = []) { return (meshes || []).map(mesh => this.registerTerrainMesh(mesh)).filter(Boolean); }
  refreshFromOlam() { return this.registerKnownTerrainMeshes(this.olam?.__awtsmoosGroundCollisionMeshes || []); }
  queryTerrainNear(x = 0, z = 0, radius = this.queryRadius) {
    this.refreshFromOlam();
    return this.index.queryCircle(finite(x), finite(z), finite(radius), e => e.kind === "terrain", { limit:24 })
      .map(entry => entry.ref).filter(Boolean);
  }
  groundAt(x = 0, z = 0, options = {}) {
    const fallback = finite(options.fallback, 0), radius = finite(options.radius, this.queryRadius);
    if (cachedHitValid(this.lastHit, x, z, this.cacheEpsilon)) return this._cacheHit();
    const candidates = this.queryTerrainNear(x, z, radius);
    this.fullSceneTraversalsAvoided += 1;
    if (!candidates.length) return this._fallback(x, z, fallback, options, "no-terrain-mesh-in-bubble");
    return this._rayGround(x, z, fallback, candidates, options);
  }
  _cacheHit() { this.cacheHits += 1; this.fullSceneTraversalsAvoided += 1; return this.lastHit; }
  _rayGround(x, z, fallback, candidates, options) {
    const high = Math.max(fallback + 220, finite(options.high, 180));
    RAYCASTER.set(new THREE.Vector3(finite(x), high, finite(z)), DOWN);
    RAYCASTER.near = 0; RAYCASTER.far = Math.max(260, high - fallback + 80);
    const hit = RAYCASTER.intersectObjects(candidates, true).find(row => row?.object && !row.object.userData?.skipRaycast && Number.isFinite(row.point?.y));
    if (!hit) return this._fallback(x, z, fallback, options, "ray-missed-terrain-bubble");
    const normal = hit.face?.normal ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0);
    if (hit.object?.matrixWorld) normal.applyMatrix3(NORMAL_MATRIX.getNormalMatrix(hit.object.matrixWorld)).normalize();
    this.lastHit = this._meshHit(x, z, hit, normal); publishReport(this.olam, this.lastHit, false); return this.lastHit;
  }
  _meshHit(x, z, hit, normal) {
    const identity = surfaceIdentity(hit, normal);
    return { x:finite(x), z:finite(z), y:hit.point.y, point:hit.point.clone(), normal,
      distance:hit.distance, source:"mesh", fallback:false, ...identity,
      mesh:hit.object.name || hit.object.uuid || "terrain", meshUuid:hit.object.uuid || null,
      triangleId:Number.isFinite(hit.faceIndex) ? hit.faceIndex : null, object:hit.object };
  }
  _fallback(x, z, fallback, options, reason) { this.fallbackUsed += 1; this.lastHit = fallbackHit(this.olam, x, z, fallback, options, reason); return this.lastHit; }
  diag() { return diagPayload(this); }
}
export function ensureGroundCollisionWorld(olam) { if (!olam) return null; if (!olam.__awtsmoosGroundCollisionWorld) olam.__awtsmoosGroundCollisionWorld = new GroundCollisionWorld(olam); return olam.__awtsmoosGroundCollisionWorld; }
export function registerGroundMesh(olam, mesh, options) { return ensureGroundCollisionWorld(olam)?.registerTerrainMesh(mesh, options) || null; }
export function meshGroundHit(olam, x, z, options = {}) { return ensureGroundCollisionWorld(olam)?.groundAt(x, z, options) || null; }
