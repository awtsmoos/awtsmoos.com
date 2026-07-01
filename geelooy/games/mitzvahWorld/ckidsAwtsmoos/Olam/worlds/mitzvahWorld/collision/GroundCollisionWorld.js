// B"H
/**
 * @file GroundCollisionWorld.js
 *
 * Purpose:
 * Mesh-direct terrain authority queried through the player collision bubble.
 *
 * Runtime owner:
 * CollisionRuntime and PlayerCollisionBubble.
 *
 * Inputs:
 * Registered terrain Object3D/Mesh roots from the terrain builder/loadNivrayim.
 *
 * Outputs:
 * Ground hit records with point, normal, source mesh, triangle id, and fallback
 * status.
 *
 * Performance:
 * Never traverses scene.children. Reuses terrain registrations and returns a
 * same-position cached mesh hit before invoking Raycaster again.
 *
 * Fallback:
 * TerrainMath/fallbackFn may run only when no registered mesh exists or the
 * local mesh ray misses, and the reason is recorded.
 *
 * Diagnostics:
 * diag() reports terrain counts, cache hits, avoided full-scene traversals,
 * fallback count, and last hit source.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import SpatialBubbleIndex from "./SpatialBubbleIndex.js";

const DOWN = new THREE.Vector3(0, -1, 0);
const RAYCASTER = new THREE.Raycaster();
const BOX = new THREE.Box3();
const NORMAL_MATRIX = new THREE.Matrix3();

function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function meshId(mesh) {
  return mesh?.uuid || mesh?.name || `terrain_${Math.random().toString(36).slice(2)}`;
}

function terrainLike(mesh) {
  const data = mesh?.userData || {};
  return Boolean(mesh?.isObject3D && !data.skipRaycast && !data.noRaycast && (data.isTerrain || data.awtsmoosGroundCollider || data.awtsmoosMeshGroundAuthority || /terrain|ground/i.test(mesh.name || "")));
}

function worldBounds(root) {
  BOX.makeEmpty();
  root?.updateWorldMatrix?.(true, true);
  root?.traverse?.(child => {
    if (!child?.isMesh || !child.geometry || child.userData?.skipRaycast || child.userData?.noRaycast) return;
    child.geometry.computeBoundingBox?.();
    if (!child.geometry.boundingBox) return;
    BOX.union(child.geometry.boundingBox.clone().applyMatrix4(child.matrixWorld));
  });
  return BOX.isEmpty() ? null : BOX.clone();
}

export default class GroundCollisionWorld {
  constructor(olam, options = {}) {
    this.olam = olam || null;
    this.index = options.index || new SpatialBubbleIndex({ cellSize:options.cellSize || 24 });
    this.meshes = new Map();
    this.lastHit = null;
    this.fallbackUsed = 0;
    this.cacheHits = 0;
    this.fullSceneTraversalsAvoided = 0;
    this.queryRadius = Math.max(4, finite(options.queryRadius, 28));
    this.cacheEpsilon = Math.max(0.005, finite(options.cacheEpsilon, 0.04));
  }

  registerTerrainMesh(mesh, options = {}) {
    if (!terrainLike(mesh)) return null;
    const id = options.id || meshId(mesh);
    const existing = this.meshes.get(id);
    if (existing?.mesh === mesh && !options.force) return existing;
    const bounds = worldBounds(mesh);
    if (!bounds) return null;
    const entry = this.index.register({ id:`terrain:${id}`, kind:"terrain", layer:0, bounds, ref:mesh, source:"mesh" });
    this.meshes.set(id, { id, mesh, bounds, entryId:entry.id, registeredAt:Date.now() });
    return this.meshes.get(id);
  }

  registerKnownTerrainMeshes(meshes = []) {
    const out = [];
    for (const mesh of meshes || []) {
      const registered = this.registerTerrainMesh(mesh);
      if (registered) out.push(registered);
    }
    return out;
  }

  refreshFromOlam() {
    const list = this.olam?.__awtsmoosGroundCollisionMeshes || [];
    return this.registerKnownTerrainMeshes(list);
  }

  queryTerrainNear(x = 0, z = 0, radius = this.queryRadius) {
    this.refreshFromOlam();
    const entries = this.index.queryCircle(finite(x), finite(z), finite(radius), entry => entry.kind === "terrain", { limit:24 });
    return entries.map(entry => entry.ref).filter(Boolean);
  }

  groundAt(x = 0, z = 0, options = {}) {
    const fallback = finite(options.fallback, 0);
    const radius = finite(options.radius, this.queryRadius);
    if (this._cachedHitValid(x, z)) {
      this.cacheHits += 1;
      this.fullSceneTraversalsAvoided += 1;
      return this.lastHit;
    }
    const candidates = this.queryTerrainNear(x, z, radius);
    this.fullSceneTraversalsAvoided += 1;
    if (!candidates.length) return this._fallback(x, z, fallback, options, "no-terrain-mesh-in-bubble");
    const high = Math.max(fallback + 220, finite(options.high, 180));
    RAYCASTER.set(new THREE.Vector3(finite(x), high, finite(z)), DOWN);
    RAYCASTER.near = 0;
    RAYCASTER.far = Math.max(260, high - fallback + 80);
    const hit = RAYCASTER.intersectObjects(candidates, true).find(row => row?.object && !row.object.userData?.skipRaycast && Number.isFinite(row.point?.y));
    if (!hit) return this._fallback(x, z, fallback, options, "ray-missed-terrain-bubble");
    const normal = hit.face?.normal ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0);
    if (hit.object?.matrixWorld) normal.applyMatrix3(NORMAL_MATRIX.getNormalMatrix(hit.object.matrixWorld)).normalize();
    this.lastHit = {
      x:finite(x),
      z:finite(z),
      y:hit.point.y,
      point:hit.point.clone(),
      normal,
      distance:hit.distance,
      source:"mesh",
      fallback:false,
      mesh:hit.object.name || hit.object.uuid || "terrain",
      meshUuid:hit.object.uuid || null,
      triangleId:Number.isFinite(hit.faceIndex) ? hit.faceIndex : null,
      object:hit.object
    };
    this.olam && (this.olam.__awtsmoosGroundCollisionReport = { ...(this.olam.__awtsmoosGroundCollisionReport || {}), last:this.lastHit, fallbackUsed:false });
    return this.lastHit;
  }

  _cachedHitValid(x, z) {
    if (!this.lastHit || this.lastHit.fallback || this.lastHit.source !== "mesh") return false;
    return Math.abs(finite(x) - this.lastHit.x) <= this.cacheEpsilon && Math.abs(finite(z) - this.lastHit.z) <= this.cacheEpsilon;
  }

  _fallback(x, z, fallback, options, reason) {
    this.fallbackUsed += 1;
    const value = typeof options.fallbackFn === "function" ? options.fallbackFn(x, z, fallback) : fallback;
    this.lastHit = {
      x:finite(x),
      z:finite(z),
      y:finite(value, fallback),
      point:new THREE.Vector3(finite(x), finite(value, fallback), finite(z)),
      normal:new THREE.Vector3(0, 1, 0),
      distance:0,
      source:"fallback",
      fallback:true,
      reason,
      mesh:null,
      meshUuid:null,
      triangleId:null,
      object:null
    };
    this.olam && (this.olam.__awtsmoosGroundCollisionReport = { ...(this.olam.__awtsmoosGroundCollisionReport || {}), last:this.lastHit, fallbackUsed:true });
    return this.lastHit;
  }

  diag() {
    return {
      terrainMeshes:this.meshes.size,
      lastHit:this.lastHit ? {
        x:this.lastHit.x,
        z:this.lastHit.z,
        y:this.lastHit.y,
        distance:this.lastHit.distance,
        source:this.lastHit.source,
        fallback:this.lastHit.fallback,
        reason:this.lastHit.reason || null,
        mesh:this.lastHit.mesh || null,
        meshUuid:this.lastHit.meshUuid || null,
        triangleId:this.lastHit.triangleId,
        normal:this.lastHit.normal ? { x:this.lastHit.normal.x, y:this.lastHit.normal.y, z:this.lastHit.normal.z } : null
      } : null,
      fallbackUsed:this.fallbackUsed,
      cacheHits:this.cacheHits,
      fullSceneTraversalsAvoided:this.fullSceneTraversalsAvoided,
      index:this.index.diag()
    };
  }
}

export function ensureGroundCollisionWorld(olam) {
  if (!olam) return null;
  if (!olam.__awtsmoosGroundCollisionWorld) olam.__awtsmoosGroundCollisionWorld = new GroundCollisionWorld(olam);
  return olam.__awtsmoosGroundCollisionWorld;
}

export function registerGroundMesh(olam, mesh, options) {
  return ensureGroundCollisionWorld(olam)?.registerTerrainMesh(mesh, options) || null;
}

export function meshGroundHit(olam, x, z, options = {}) {
  return ensureGroundCollisionWorld(olam)?.groundAt(x, z, options) || null;
}
