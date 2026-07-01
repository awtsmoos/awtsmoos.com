// B"H
/**
 * @file HouseCollisionWorld.js
 * @description House collision from measured mesh/component bounds.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import SpatialBubbleIndex from "./SpatialBubbleIndex.js";

const BOX = new THREE.Box3();
const CHILD_BOX = new THREE.Box3();
const CENTER = new THREE.Vector3();

function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function contributes(child) {
  if (!child?.isMesh || !child.geometry || child.visible === false) return false;
  const data = child.userData || {};
  if (data.visualOnly || data.cottageWindowGlass || data.softShadow) return false;
  const name = String(child.name || "");
  if (/glass|curtain|banner|laundry|flower|grass|shadow|trim|knob/i.test(name) && !data.closedCollider) return false;
  return Boolean(data.cottageWallSection || data.closedCollider || data.doorPanel || data.isSolid || data.explicitCollision || data.collisionBody || data.cottageBeam || /wall|door|collider|beam|foundation|roof/i.test(name));
}

function boundsOf(child) {
  child.updateWorldMatrix?.(true, false);
  child.geometry.computeBoundingBox?.();
  if (!child.geometry.boundingBox) return null;
  CHILD_BOX.copy(child.geometry.boundingBox).applyMatrix4(child.matrixWorld);
  return CHILD_BOX.isEmpty() ? null : CHILD_BOX.clone();
}

function capsuleBounds(capsule) {
  const r = Math.max(0.01, finite(capsule?.radius, 0.45));
  BOX.min.copy(capsule.start).min(capsule.end).subScalar(r);
  BOX.max.copy(capsule.start).max(capsule.end).addScalar(r);
  return BOX.clone();
}

function verticalOverlap(bounds, capsule) {
  const cap = capsuleBounds(capsule);
  return cap.max.y >= bounds.min.y && cap.min.y <= bounds.max.y;
}

function resolveCapsuleAabb(capsule, bounds) {
  if (!capsule?.start || !capsule?.end || !verticalOverlap(bounds, capsule)) return null;
  const r = Math.max(0.01, finite(capsule.radius, 0.45));
  const cx = (capsule.start.x + capsule.end.x) * 0.5;
  const cz = (capsule.start.z + capsule.end.z) * 0.5;
  const closestX = Math.max(bounds.min.x, Math.min(bounds.max.x, cx));
  const closestZ = Math.max(bounds.min.z, Math.min(bounds.max.z, cz));
  let dx = cx - closestX;
  let dz = cz - closestZ;
  let d2 = dx * dx + dz * dz;
  if (d2 >= r * r) return null;
  if (d2 < 1e-8) {
    const left = Math.abs(cx - bounds.min.x);
    const right = Math.abs(bounds.max.x - cx);
    const front = Math.abs(cz - bounds.min.z);
    const back = Math.abs(bounds.max.z - cz);
    const min = Math.min(left, right, front, back);
    if (min === left) { dx = -1; dz = 0; d2 = 1; }
    else if (min === right) { dx = 1; dz = 0; d2 = 1; }
    else if (min === front) { dx = 0; dz = -1; d2 = 1; }
    else { dx = 0; dz = 1; d2 = 1; }
    return { normal:new THREE.Vector3(dx, 0, dz), depth:r + min };
  }
  const dist = Math.sqrt(d2);
  return { normal:new THREE.Vector3(dx / dist, 0, dz / dist), depth:r - dist };
}

export default class HouseCollisionWorld {
  constructor(olam, options = {}) {
    this.olam = olam || null;
    this.index = options.index || new SpatialBubbleIndex({ cellSize:options.cellSize || 10 });
    this.houses = new Map();
    this.colliders = new Map();
    this.lastCollision = null;
    this.measuredProxyCount = 0;
    this.queryRadius = Math.max(2, finite(options.queryRadius, 8));
  }

  registerHouseRoot(root, options = {}) {
    if (!root?.isObject3D || this.houses.has(root.uuid)) return this.houses.get(root?.uuid) || null;
    root.updateWorldMatrix?.(true, true);
    const houseId = options.houseId || root.userData?.houseId || root.name || root.uuid;
    const records = [];
    root.traverse?.(child => {
      if (!contributes(child)) return;
      const bounds = boundsOf(child);
      if (!bounds) return;
      const id = `house:${houseId}:${child.uuid}`;
      bounds.getCenter(CENTER);
      const proof = {
        source:"measured-mesh-bounds",
        houseId,
        childName:child.name || null,
        childUuid:child.uuid,
        geometryUuid:child.geometry?.uuid || null,
        triangleCount:child.geometry?.index ? Math.ceil(child.geometry.index.count / 3) : Math.ceil((child.geometry?.attributes?.position?.count || 0) / 3),
        generatedFrom:"child-mesh-world-bounds"
      };
      const entry = this.index.register({ id, kind:"house", layer:0, bounds, ref:child, houseId, proof });
      const record = { id, bounds:bounds.clone(), mesh:child, houseId, proof, entryId:entry.id };
      this.colliders.set(id, record);
      records.push(record);
      this.measuredProxyCount += 1;
    });
    const house = { id:houseId, root, records, registeredAt:Date.now(), measured:records.length };
    this.houses.set(root.uuid, house);
    this.olam && (this.olam.__awtsmoosHouseCollisionWorld = this);
    return house;
  }

  registerKnownHouseRoots(roots = []) {
    const out = [];
    for (const root of roots || []) {
      const house = this.registerHouseRoot(root);
      if (house) out.push(house);
    }
    return out;
  }

  querySolidsNear(x = 0, z = 0, radius = this.queryRadius) {
    return this.index.queryCircle(finite(x), finite(z), finite(radius), entry => entry.kind === "house", { limit:64 })
      .map(entry => this.colliders.get(entry.id))
      .filter(Boolean);
  }

  resolveCapsule(capsule, options = {}) {
    if (!capsule?.start || !capsule?.end) return null;
    const x = (capsule.start.x + capsule.end.x) * 0.5;
    const z = (capsule.start.z + capsule.end.z) * 0.5;
    const radius = finite(options.radius, this.queryRadius + finite(capsule.radius, 0.45));
    const candidates = this.querySolidsNear(x, z, radius);
    let best = null;
    for (const collider of candidates) {
      const hit = resolveCapsuleAabb(capsule, collider.bounds);
      if (!hit) continue;
      if (!best || hit.depth > best.depth) best = { ...hit, collider };
    }
    if (!best) return null;
    this.lastCollision = {
      at:Date.now(),
      depth:best.depth,
      normal:{ x:best.normal.x, y:best.normal.y, z:best.normal.z },
      source:"measured-mesh-proxy",
      houseId:best.collider.houseId,
      colliderId:best.collider.id,
      proof:best.collider.proof
    };
    this.olam && (this.olam.__lastHouseCollision = this.lastCollision);
    return best;
  }

  diag() {
    return {
      houses:this.houses.size,
      houseColliders:this.colliders.size,
      measuredProxies:this.measuredProxyCount,
      lastCollision:this.lastCollision,
      index:this.index.diag()
    };
  }
}

export function ensureHouseCollisionWorld(olam) {
  if (!olam) return null;
  if (!olam.__awtsmoosHouseCollisionWorld) olam.__awtsmoosHouseCollisionWorld = new HouseCollisionWorld(olam);
  return olam.__awtsmoosHouseCollisionWorld;
}

export function registerHouseRoot(olam, root, options) {
  return ensureHouseCollisionWorld(olam)?.registerHouseRoot(root, options) || null;
}
