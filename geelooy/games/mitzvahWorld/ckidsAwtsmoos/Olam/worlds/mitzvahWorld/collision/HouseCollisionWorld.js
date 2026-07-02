// B"H
/**
 * @file HouseCollisionWorld.js
 * @description Houses become solid from both measured meshes and generated
 * collider descriptors, so no cottage wall can hide from the capsule.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import SpatialBubbleIndex from "./SpatialBubbleIndex.js";
const BOX = new THREE.Box3(), CHILD_BOX = new THREE.Box3(), CENTER = new THREE.Vector3();
const TEMP = new THREE.Vector3(), MAT = new THREE.Matrix4(), YAW = new THREE.Matrix4();
function finite(value, fallback = 0) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
function contributes(child) {
  if (!child?.isMesh || !child.geometry || child.visible === false) return false;
  const data = child.userData || {}, name = String(child.name || "");
  if (data.visualOnly || data.cottageWindowGlass || data.softShadow) return false;
  if (/glass|curtain|banner|laundry|flower|grass|shadow|trim|knob/i.test(name) && !data.closedCollider) return false;
  return Boolean(data.cottageWallSection || data.closedCollider || data.doorPanel || data.isSolid || data.explicitCollision || data.collisionBody || data.cottageBeam || /wall|door|collider|beam|foundation|roof/i.test(name));
}
function boundsOf(child) { child.updateWorldMatrix?.(true, false); child.geometry.computeBoundingBox?.(); if (!child.geometry.boundingBox) return null; CHILD_BOX.copy(child.geometry.boundingBox).applyMatrix4(child.matrixWorld); return CHILD_BOX.isEmpty() ? null : CHILD_BOX.clone(); }
function descriptorBounds(source, owner) {
  const p = source?.position, s = source?.size; if (!Array.isArray(p) || !Array.isArray(s)) return null;
  const hx = Math.abs(finite(s[0])) / 2, hy = Math.abs(finite(s[1])) / 2, hz = Math.abs(finite(s[2])) / 2;
  if (!hx || !hy || !hz) return null; YAW.makeRotationY(finite(source.yaw)); MAT.copy(owner.matrixWorld || new THREE.Matrix4()).multiply(YAW); BOX.makeEmpty();
  for (const x of [-hx, hx]) for (const y of [-hy, hy]) for (const z of [-hz, hz]) { TEMP.set(finite(p[0]) + x, finite(p[1]) + y, finite(p[2]) + z).applyMatrix4(MAT); BOX.expandByPoint(TEMP); }
  return BOX.isEmpty() ? null : BOX.clone();
}
function capsuleBounds(capsule) { const r = Math.max(0.01, finite(capsule?.radius, 0.45)); BOX.min.copy(capsule.start).min(capsule.end).subScalar(r); BOX.max.copy(capsule.start).max(capsule.end).addScalar(r); return BOX.clone(); }
function verticalOverlap(bounds, capsule) { const cap = capsuleBounds(capsule); return cap.max.y >= bounds.min.y && cap.min.y <= bounds.max.y; }
function resolveCapsuleAabb(capsule, bounds) {
  if (!capsule?.start || !capsule?.end || !verticalOverlap(bounds, capsule)) return null;
  const r = Math.max(0.01, finite(capsule.radius, 0.45)), cx = (capsule.start.x + capsule.end.x) * .5, cz = (capsule.start.z + capsule.end.z) * .5;
  const closestX = Math.max(bounds.min.x, Math.min(bounds.max.x, cx)), closestZ = Math.max(bounds.min.z, Math.min(bounds.max.z, cz));
  let dx = cx - closestX, dz = cz - closestZ, d2 = dx * dx + dz * dz; if (d2 >= r * r) return null;
  if (d2 < 1e-8) { const left = Math.abs(cx - bounds.min.x), right = Math.abs(bounds.max.x - cx), front = Math.abs(cz - bounds.min.z), back = Math.abs(bounds.max.z - cz), min = Math.min(left, right, front, back); if (min === left) { dx = -1; dz = 0; } else if (min === right) { dx = 1; dz = 0; } else if (min === front) { dx = 0; dz = -1; } else { dx = 0; dz = 1; } return { normal:new THREE.Vector3(dx, 0, dz), depth:r + min }; }
  const dist = Math.sqrt(d2); return { normal:new THREE.Vector3(dx / dist, 0, dz / dist), depth:r - dist };
}
export default class HouseCollisionWorld {
  constructor(olam, options = {}) { this.olam = olam || null; this.index = options.index || new SpatialBubbleIndex({ cellSize:options.cellSize || 10 }); this.houses = new Map(); this.colliders = new Map(); this.lastCollision = null; this.measuredProxyCount = 0; this.descriptorProxyCount = 0; this.queryRadius = Math.max(2, finite(options.queryRadius, 8)); }
  forgetHouse(root) { const old = root?.uuid ? this.houses.get(root.uuid) : null; if (!old) return; for (const r of old.records || []) { this.index.remove(r.id); this.colliders.delete(r.id); } this.houses.delete(root.uuid); }
  addRecord(id, bounds, ref, houseId, proof, records) { bounds.getCenter(CENTER); const entry = this.index.register({ id, kind:"house", layer:0, bounds, ref, houseId, proof }); const record = { id, bounds:bounds.clone(), mesh:ref, houseId, proof, entryId:entry.id }; this.colliders.set(id, record); records.push(record); return record; }
  registerHouseRoot(root, options = {}) {
    if (!root?.isObject3D) return null; this.forgetHouse(root); root.updateWorldMatrix?.(true, true);
    const houseId = options.houseId || root.userData?.houseId || root.name || root.uuid, records = [];
    root.traverse?.(child => { if (contributes(child)) { const bounds = boundsOf(child); if (bounds) { const proof = { source:"measured-mesh-bounds", houseId, childName:child.name || null, childUuid:child.uuid, generatedFrom:"child-mesh-world-bounds" }; this.addRecord(`house:${houseId}:mesh:${child.uuid}`, bounds, child, houseId, proof, records); this.measuredProxyCount += 1; } } const sources = child.userData?.colliderSources; if (Array.isArray(sources)) sources.forEach((src, i) => { if (src?.solid === false) return; const bounds = descriptorBounds(src, child); if (!bounds) return; const proof = { source:"generated-collider-descriptor", houseId, descriptorId:src.id || null, ownerName:child.name || null, yaw:src.yaw || 0 }; this.addRecord(`house:${houseId}:descriptor:${src.id || child.uuid + ':' + i}`, bounds, child, houseId, proof, records); this.descriptorProxyCount += 1; }); });
    const house = { id:houseId, root, records, registeredAt:Date.now(), measured:records.length }; this.houses.set(root.uuid, house); this.olam && (this.olam.__awtsmoosHouseCollisionWorld = this); return house;
  }
  registerKnownHouseRoots(roots = []) { const out = []; for (const root of roots || []) { const house = this.registerHouseRoot(root); if (house) out.push(house); } return out; }
  querySolidsNear(x = 0, z = 0, radius = this.queryRadius) { return this.index.queryCircle(finite(x), finite(z), finite(radius), e => e.kind === "house", { limit:128 }).map(e => this.colliders.get(e.id)).filter(Boolean); }
  resolveCapsule(capsule, options = {}) { if (!capsule?.start || !capsule?.end) return null; const x = (capsule.start.x + capsule.end.x) * .5, z = (capsule.start.z + capsule.end.z) * .5, radius = finite(options.radius, this.queryRadius + finite(capsule.radius, .45)); const candidates = this.querySolidsNear(x, z, radius); let best = null; for (const collider of candidates) { const hit = resolveCapsuleAabb(capsule, collider.bounds); if (hit && (!best || hit.depth > best.depth)) best = { ...hit, collider }; } if (!best) return null; this.lastCollision = { at:Date.now(), depth:best.depth, normal:{ x:best.normal.x, y:best.normal.y, z:best.normal.z }, source:best.collider.proof?.source || "house-proxy", houseId:best.collider.houseId, colliderId:best.collider.id, proof:best.collider.proof }; this.olam && (this.olam.__lastHouseCollision = this.lastCollision); return best; }
  diag() { return { houses:this.houses.size, houseColliders:this.colliders.size, measuredProxies:this.measuredProxyCount, descriptorProxies:this.descriptorProxyCount, lastCollision:this.lastCollision, index:this.index.diag() }; }
}
export function ensureHouseCollisionWorld(olam) { if (!olam) return null; if (!olam.__awtsmoosHouseCollisionWorld) olam.__awtsmoosHouseCollisionWorld = new HouseCollisionWorld(olam); return olam.__awtsmoosHouseCollisionWorld; }
export function registerHouseRoot(olam, root, options) { return ensureHouseCollisionWorld(olam)?.registerHouseRoot(root, options) || null; }
