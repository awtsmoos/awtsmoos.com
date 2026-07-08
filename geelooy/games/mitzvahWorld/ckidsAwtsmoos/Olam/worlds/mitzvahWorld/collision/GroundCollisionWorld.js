// B"H
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import SpatialBubbleIndex from "./SpatialBubbleIndex.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { DOWN, NORMAL_MATRIX, RAYCASTER, finite } from "./groundWorld/GroundWorldMath.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { terrainRecord } from "./groundWorld/GroundTerrainRegistry.js?compact=true&v=octree-dirty-fix-20260702-bh1";
import { cachedHitValid, diagPayload, fallbackHit, publishReport } from "./groundWorld/GroundHitCache.js?compact=true&v=octree-ground-cache-20260702-bh1";
import { surfaceIdentity } from "./groundWorld/GroundSurfaceIdentity.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const UP = new THREE.Vector3(0, 1, 0), RAY = new THREE.Ray(), V1 = new THREE.Vector3(), V2 = new THREE.Vector3();
const tmpBox = new THREE.Box3(), tmpSize = new THREE.Vector3(), tmpMin = new THREE.Vector3();
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
function raycastAllowed(options) { return options?.allowInitialRaycast === true || options?.phase === "initial-grounding" || options?.source === "initial-grounding"; }
class OctreeNode {
  constructor(box, level = 0) { this.box = box; this.level = level; this.triangles = []; this.children = []; }
  split(maxLevel, perLeaf) {
    if (this.triangles.length <= perLeaf || this.level >= maxLevel) return;
    const half = this.box.getSize(tmpSize).multiplyScalar(0.5), kids = [];
    for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) for (let z = 0; z < 2; z++) {
      const min = tmpMin.set(this.box.min.x + x * half.x, this.box.min.y + y * half.y, this.box.min.z + z * half.z).clone();
      kids.push(new OctreeNode(new THREE.Box3(min, min.clone().add(half)), this.level + 1));
    }
    for (const tri of this.triangles) for (const kid of kids) if (kid.box.intersectsTriangle(tri)) kid.triangles.push(tri);
    this.triangles.length = 0;
    for (const kid of kids) if (kid.triangles.length) { kid.split(maxLevel, perLeaf); this.children.push(kid); }
  }
  rayTriangles(ray, out, seen) { for (const kid of this.children) { if (!ray.intersectsBox(kid.box)) continue; if (kid.children.length) kid.rayTriangles(ray, out, seen); else for (const tri of kid.triangles) if (!seen.has(tri)) { seen.add(tri); out.push(tri); } } }
}
class InlineTerrainOctreeWorld {
  constructor(options = {}) { this.triangles = []; this.bounds = new THREE.Box3(); this.root = null; this.maxLevel = options.maxLevel || 10; this.trianglesPerLeaf = options.trianglesPerLeaf || 12; this.stats = { builds:0, triangles:0, rayQueries:0, candidates:0, hits:0 }; }
  clear() { this.triangles.length = 0; this.bounds.makeEmpty(); this.root = null; return this; }
  addMesh(mesh) {
    if (!mesh?.geometry?.attributes?.position) return 0; mesh.updateWorldMatrix?.(true, false);
    const g = mesh.geometry, pos = g.attributes.position, idx = g.index?.array; let count = 0;
    const add = (ia, ib, ic) => { const a = new THREE.Vector3().fromBufferAttribute(pos, ia).applyMatrix4(mesh.matrixWorld), b = new THREE.Vector3().fromBufferAttribute(pos, ib).applyMatrix4(mesh.matrixWorld), c = new THREE.Vector3().fromBufferAttribute(pos, ic).applyMatrix4(mesh.matrixWorld); const tri = new THREE.Triangle(a, b, c); tri.__mesh = mesh; this.triangles.push(tri); this.bounds.expandByPoint(a).expandByPoint(b).expandByPoint(c); count++; };
    if (idx) for (let i = 0; i < idx.length; i += 3) add(idx[i], idx[i + 1], idx[i + 2]); else for (let i = 0; i < pos.count; i += 3) add(i, i + 1, i + 2);
    return count;
  }
  build(meshes = []) { this.clear(); for (const mesh of meshes) this.addMesh(mesh); if (!this.triangles.length) return this; this.bounds.min.addScalar(-0.01); this.bounds.max.addScalar(0.01); this.root = new OctreeNode(this.bounds.clone(), 0); this.root.triangles = this.triangles.slice(); this.root.split(this.maxLevel, this.trianglesPerLeaf); this.stats.builds++; this.stats.triangles = this.triangles.length; return this; }
  rayTriangles(ray) { const out = []; if (!this.root) return out; this.root.rayTriangles(ray, out, new Set()); this.stats.rayQueries++; this.stats.candidates += out.length; return out; }
  rayGroundAt(x, z, high = 220, low = -80) { RAY.origin.set(num(x), high, num(z)); RAY.direction.set(0, -1, 0); let best = null, bestD = Infinity; for (const tri of this.rayTriangles(RAY)) { const p = RAY.intersectTriangle(tri.a, tri.b, tri.c, false, V1); if (!p || p.y > high || p.y < low) continue; const d = high - p.y; if (d < bestD) { bestD = d; best = { y:p.y, point:p.clone(), normal:tri.getNormal(new THREE.Vector3()), distance:d, object:tri.__mesh || null, triangle:tri }; } } if (best) this.stats.hits++; return best; }
  diag() { return { ...this.stats, hasRoot:Boolean(this.root), maxLevel:this.maxLevel, trianglesPerLeaf:this.trianglesPerLeaf, bounds:this.root ? { min:this.bounds.min.toArray(), max:this.bounds.max.toArray() } : null }; }
}
function meshHitFromOctree(x, z, hit) {
  const object = hit.object || null, normal = hit.normal || UP, identity = object ? surfaceIdentity({ object }, normal) : {};
  return { x:num(x), z:num(z), y:hit.y, point:hit.point, normal, distance:hit.distance, source:"octree", fallback:false, ...identity, surfaceKey:identity.surfaceKey || object?.userData?.surfaceKey || "terrain", materialKey:identity.materialKey || object?.userData?.materialKey || "terrain", biomeKey:identity.biomeKey || object?.userData?.biomeKey || "terrain", walkable:true, slopeDegrees:normal.angleTo(UP) * 180 / Math.PI, mesh:object?.name || object?.uuid || "octree-terrain", meshUuid:object?.uuid || null, triangleId:null, object };
}
export default class GroundCollisionWorld {
  constructor(olam, options = {}) { this.olam = olam || null; this.index = options.index || new SpatialBubbleIndex({ cellSize:options.cellSize || 24 }); this.meshes = new Map(); this.octree = new InlineTerrainOctreeWorld({ maxLevel:10, trianglesPerLeaf:12 }); this.octreeDirty = true; this.lastHit = null; this.fallbackUsed = 0; this.cacheHits = 0; this.fullSceneTraversalsAvoided = 0; this.raycastAttempts = 0; this.runtimeRaycastsBlocked = 0; this.octreeHits = 0; this.queryRadius = Math.max(4, finite(options.queryRadius, 28)); this.cacheEpsilon = Math.max(0.005, finite(options.cacheEpsilon, 0.04)); }
  registerTerrainMesh(mesh, options = {}) { const rec = terrainRecord(this.index, this.meshes, mesh, options); if (rec?.changed) this.octreeDirty = true; return rec; }
  registerKnownTerrainMeshes(meshes = []) { return (meshes || []).map(mesh => this.registerTerrainMesh(mesh)).filter(Boolean); }
  refreshFromOlam() { return this.registerKnownTerrainMeshes(this.olam?.__awtsmoosGroundCollisionMeshes || []); }
  ensureOctree() { this.refreshFromOlam(); if (this.octreeDirty) { this.octree.build(Array.from(this.meshes.values()).map(row => row?.mesh || row?.object || row).filter(Boolean)); this.octreeDirty = false; } return this.octree; }
  queryTerrainNear(x = 0, z = 0, radius = this.queryRadius) { this.refreshFromOlam(); return this.index.queryCircle(finite(x), finite(z), finite(radius), e => e.kind === "terrain", { limit:24 }).map(entry => entry.ref).filter(Boolean); }
  groundAt(x = 0, z = 0, options = {}) {
    const fallback = finite(options.fallback, 0); if (cachedHitValid(this.lastHit, x, z, this.cacheEpsilon)) return this._cacheHit();
    const high = Math.max(fallback + 80, finite(options.high, 220)), low = Math.min(fallback - 80, finite(options.low, -80));
    const octHit = this.ensureOctree().rayGroundAt(x, z, high, low); if (octHit) return this._octreeHit(x, z, octHit);
    if (!raycastAllowed(options)) { this.runtimeRaycastsBlocked += 1; this.fullSceneTraversalsAvoided += 1; return this._fallback(x, z, fallback, options, "octree-missed-runtime-raycaster-forbidden"); }
    const candidates = this.queryTerrainNear(x, z, finite(options.radius, this.queryRadius)); this.fullSceneTraversalsAvoided += 1;
    if (!candidates.length) return this._fallback(x, z, fallback, options, "initial-grounding-no-terrain-mesh-in-bubble");
    return this._rayGround(x, z, fallback, candidates, options);
  }
  capsuleIntersect() { return false; }
  _octreeHit(x, z, hit) { this.octreeHits++; this.lastHit = meshHitFromOctree(x, z, hit); publishReport(this.olam, this.lastHit, false); return this.lastHit; }
  _cacheHit() { this.cacheHits += 1; this.fullSceneTraversalsAvoided += 1; return this.lastHit; }
  _rayGround(x, z, fallback, candidates, options) { this.raycastAttempts += 1; const high = Math.max(fallback + 220, finite(options.high, 180)); RAYCASTER.set(new THREE.Vector3(finite(x), high, finite(z)), DOWN); RAYCASTER.near = 0; RAYCASTER.far = Math.max(260, high - fallback + 80); const hit = RAYCASTER.intersectObjects(candidates, true).find(row => row?.object && !row.object.userData?.skipRaycast && Number.isFinite(row.point?.y)); if (!hit) return this._fallback(x, z, fallback, options, "initial-grounding-ray-missed-terrain-bubble"); const normal = hit.face?.normal ? hit.face.normal.clone() : UP.clone(); if (hit.object?.matrixWorld) normal.applyMatrix3(NORMAL_MATRIX.getNormalMatrix(hit.object.matrixWorld)).normalize(); this.lastHit = this._meshHit(x, z, hit, normal); publishReport(this.olam, this.lastHit, false); return this.lastHit; }
  _meshHit(x, z, hit, normal) { const identity = surfaceIdentity(hit, normal); return { x:finite(x), z:finite(z), y:hit.point.y, point:hit.point.clone(), normal, distance:hit.distance, source:"initial-raycast-grounding", fallback:false, ...identity, mesh:hit.object.name || hit.object.uuid || "terrain", meshUuid:hit.object.uuid || null, triangleId:Number.isFinite(hit.faceIndex) ? hit.faceIndex : null, object:hit.object }; }
  _fallback(x, z, fallback, options, reason) { this.fallbackUsed += 1; this.lastHit = fallbackHit(this.olam, x, z, fallback, options, reason); return this.lastHit; }
  diag() { return { ...diagPayload(this), octreeHits:this.octreeHits, raycastAttempts:this.raycastAttempts, runtimeRaycastsBlocked:this.runtimeRaycastsBlocked, raycastPolicy:"runtime uses inline TerrainOctreeWorld; Raycaster only explicit initial-grounding", octree:this.octree?.diag?.() || null }; }
}
export function ensureGroundCollisionWorld(olam) { if (!olam) return null; if (!olam.__awtsmoosGroundCollisionWorld) olam.__awtsmoosGroundCollisionWorld = new GroundCollisionWorld(olam); return olam.__awtsmoosGroundCollisionWorld; }
export function registerGroundMesh(olam, mesh, options) { return ensureGroundCollisionWorld(olam)?.registerTerrainMesh(mesh, options) || null; }
export function meshGroundHit(olam, x, z, options = {}) { return ensureGroundCollisionWorld(olam)?.groundAt(x, z, options) || null; }
