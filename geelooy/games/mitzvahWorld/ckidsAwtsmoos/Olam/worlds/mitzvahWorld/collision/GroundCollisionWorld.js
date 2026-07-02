// B"H
import * as THREE from "/games/scripts/build/three.module.js";
import SpatialBubbleIndex from "./SpatialBubbleIndex.js";
import TerrainOctreeWorld from "./TerrainOctreeWorld.js?v=real-octree-ground-20260701-bh2";
import { DOWN, NORMAL_MATRIX, RAYCASTER, finite } from "./groundWorld/GroundWorldMath.js";
import { terrainRecord } from "./groundWorld/GroundTerrainRegistry.js";
import { cachedHitValid, diagPayload, fallbackHit, publishReport } from "./groundWorld/GroundHitCache.js";
import { surfaceIdentity } from "./groundWorld/GroundSurfaceIdentity.js";
const UP = new THREE.Vector3(0, 1, 0);
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
function raycastAllowed(options) { return options?.allowInitialRaycast === true || options?.phase === "initial-grounding" || options?.source === "initial-grounding"; }
function meshHitFromOctree(x, z, hit) {
  const object = hit.object || null, normal = hit.normal || UP, identity = object ? surfaceIdentity({ object }, normal) : {};
  return { x:num(x), z:num(z), y:hit.y, point:hit.point, normal, distance:hit.distance, source:"octree", fallback:false, ...identity, surfaceKey:identity.surfaceKey || object?.userData?.surfaceKey || "terrain", materialKey:identity.materialKey || object?.userData?.materialKey || "terrain", biomeKey:identity.biomeKey || object?.userData?.biomeKey || "terrain", walkable:true, slopeDegrees:normal.angleTo(UP) * 180 / Math.PI, mesh:object?.name || object?.uuid || "octree-terrain", meshUuid:object?.uuid || null, triangleId:null, object };
}
/** Runtime ground authority: terrain octree; Raycaster only explicit initial grounding. */
export default class GroundCollisionWorld {
  constructor(olam, options = {}) {
    this.olam = olam || null; this.index = options.index || new SpatialBubbleIndex({ cellSize:options.cellSize || 24 });
    this.meshes = new Map(); this.octree = new TerrainOctreeWorld({ maxLevel:10, trianglesPerLeaf:12 });
    this.octreeDirty = true; this.lastHit = null; this.fallbackUsed = 0; this.cacheHits = 0; this.fullSceneTraversalsAvoided = 0; this.raycastAttempts = 0; this.runtimeRaycastsBlocked = 0; this.octreeHits = 0;
    this.queryRadius = Math.max(4, finite(options.queryRadius, 28)); this.cacheEpsilon = Math.max(0.005, finite(options.cacheEpsilon, 0.04));
  }
  registerTerrainMesh(mesh, options = {}) { const rec = terrainRecord(this.index, this.meshes, mesh, options); this.octreeDirty = true; return rec; }
  registerKnownTerrainMeshes(meshes = []) { return (meshes || []).map(mesh => this.registerTerrainMesh(mesh)).filter(Boolean); }
  refreshFromOlam() { return this.registerKnownTerrainMeshes(this.olam?.__awtsmoosGroundCollisionMeshes || []); }
  ensureOctree() { this.refreshFromOlam(); if (this.octreeDirty) { this.octree.build(Array.from(this.meshes.values()).map(row => row?.mesh || row?.object || row).filter(Boolean)); this.octreeDirty = false; } return this.octree; }
  queryTerrainNear(x = 0, z = 0, radius = this.queryRadius) { this.refreshFromOlam(); return this.index.queryCircle(finite(x), finite(z), finite(radius), e => e.kind === "terrain", { limit:24 }).map(entry => entry.ref).filter(Boolean); }
  groundAt(x = 0, z = 0, options = {}) {
    const fallback = finite(options.fallback, 0);
    if (cachedHitValid(this.lastHit, x, z, this.cacheEpsilon)) return this._cacheHit();
    const high = Math.max(fallback + 80, finite(options.high, 220)), low = Math.min(fallback - 80, finite(options.low, -80));
    const octHit = this.ensureOctree().rayGroundAt(x, z, high, low); if (octHit) return this._octreeHit(x, z, octHit);
    if (!raycastAllowed(options)) { this.runtimeRaycastsBlocked += 1; this.fullSceneTraversalsAvoided += 1; return this._fallback(x, z, fallback, options, "octree-missed-runtime-raycaster-forbidden"); }
    const candidates = this.queryTerrainNear(x, z, finite(options.radius, this.queryRadius)); this.fullSceneTraversalsAvoided += 1;
    if (!candidates.length) return this._fallback(x, z, fallback, options, "initial-grounding-no-terrain-mesh-in-bubble");
    return this._rayGround(x, z, fallback, candidates, options);
  }
  capsuleIntersect(capsule) { return this.ensureOctree().capsuleIntersect(capsule); }
  _octreeHit(x, z, hit) { this.octreeHits++; this.lastHit = meshHitFromOctree(x, z, hit); publishReport(this.olam, this.lastHit, false); return this.lastHit; }
  _cacheHit() { this.cacheHits += 1; this.fullSceneTraversalsAvoided += 1; return this.lastHit; }
  _rayGround(x, z, fallback, candidates, options) {
    this.raycastAttempts += 1; const high = Math.max(fallback + 220, finite(options.high, 180));
    RAYCASTER.set(new THREE.Vector3(finite(x), high, finite(z)), DOWN); RAYCASTER.near = 0; RAYCASTER.far = Math.max(260, high - fallback + 80);
    const hit = RAYCASTER.intersectObjects(candidates, true).find(row => row?.object && !row.object.userData?.skipRaycast && Number.isFinite(row.point?.y));
    if (!hit) return this._fallback(x, z, fallback, options, "initial-grounding-ray-missed-terrain-bubble");
    const normal = hit.face?.normal ? hit.face.normal.clone() : UP.clone(); if (hit.object?.matrixWorld) normal.applyMatrix3(NORMAL_MATRIX.getNormalMatrix(hit.object.matrixWorld)).normalize();
    this.lastHit = this._meshHit(x, z, hit, normal); publishReport(this.olam, this.lastHit, false); return this.lastHit;
  }
  _meshHit(x, z, hit, normal) { const identity = surfaceIdentity(hit, normal); return { x:finite(x), z:finite(z), y:hit.point.y, point:hit.point.clone(), normal, distance:hit.distance, source:"initial-raycast-grounding", fallback:false, ...identity, mesh:hit.object.name || hit.object.uuid || "terrain", meshUuid:hit.object.uuid || null, triangleId:Number.isFinite(hit.faceIndex) ? hit.faceIndex : null, object:hit.object }; }
  _fallback(x, z, fallback, options, reason) { this.fallbackUsed += 1; this.lastHit = fallbackHit(this.olam, x, z, fallback, options, reason); return this.lastHit; }
  diag() { return { ...diagPayload(this), octreeHits:this.octreeHits, raycastAttempts:this.raycastAttempts, runtimeRaycastsBlocked:this.runtimeRaycastsBlocked, raycastPolicy:"runtime uses TerrainOctreeWorld; Raycaster only explicit initial-grounding", octree:this.octree?.diag?.() || null }; }
}
export function ensureGroundCollisionWorld(olam) { if (!olam) return null; if (!olam.__awtsmoosGroundCollisionWorld) olam.__awtsmoosGroundCollisionWorld = new GroundCollisionWorld(olam); return olam.__awtsmoosGroundCollisionWorld; }
export function registerGroundMesh(olam, mesh, options) { return ensureGroundCollisionWorld(olam)?.registerTerrainMesh(mesh, options) || null; }
export function meshGroundHit(olam, x, z, options = {}) { return ensureGroundCollisionWorld(olam)?.groundAt(x, z, options) || null; }
