// B"H
/**
 * Precise cottage collision sidecar. It keeps measured wall meshes in the real
 * octree for proof, but sidecar gameplay uses tight AABBs and does not double
 * collide against broad descriptor boxes that created invisible walls.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import SpatialBubbleIndex from "./SpatialBubbleIndex.js";
const CHILD_BOX = new THREE.Box3();
const finite = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
function solidMesh(child) {
  if (!child?.isMesh || !child.geometry || child.visible === false) return false;
  const d = child.userData || {}, n = String(child.name || "");
  if (d.visualOnly || d.cottageWindowGlass || d.softShadow || d.doorPanel) return false;
  if (/glass|curtain|banner|laundry|flower|grass|shadow|trim|knob/i.test(n) && !d.closedCollider) return false;
  return Boolean(d.cottageWallSection || d.closedCollider || d.isSolid || d.explicitCollision || d.collisionBody || d.cottageBeam || /wall|beam|foundation|roof|floor/i.test(n));
}
function boundsOf(child) {
  child.updateWorldMatrix?.(true, false); child.geometry.computeBoundingBox?.(); if (!child.geometry.boundingBox) return null;
  CHILD_BOX.copy(child.geometry.boundingBox).applyMatrix4(child.matrixWorld); return CHILD_BOX.isEmpty() ? null : CHILD_BOX.clone();
}
function resolveCapsuleAabb(c, b, radius) {
  const r = Math.max(.01, finite(radius, c?.radius || .45)), y0 = Math.min(c.start.y, c.end.y) - r, y1 = Math.max(c.start.y, c.end.y) + r;
  if (y1 < b.min.y || y0 > b.max.y) return null;
  const cx = (c.start.x + c.end.x) * .5, cz = (c.start.z + c.end.z) * .5, qx = Math.max(b.min.x, Math.min(b.max.x, cx)), qz = Math.max(b.min.z, Math.min(b.max.z, cz)), dx = cx - qx, dz = cz - qz, d2 = dx * dx + dz * dz;
  if (d2 >= r * r) return null;
  if (d2 > 1e-8) { const d = Math.sqrt(d2); return { normal:new THREE.Vector3(dx / d, 0, dz / d), depth:r - d + .002 }; }
  const gaps = [Math.abs(cx - b.min.x), Math.abs(b.max.x - cx), Math.abs(cz - b.min.z), Math.abs(b.max.z - cz)], i = gaps.indexOf(Math.min(...gaps));
  return { normal:new THREE.Vector3(i === 0 ? -1 : i === 1 ? 1 : 0, 0, i === 2 ? -1 : i === 3 ? 1 : 0), depth:Math.min(r, gaps[i]) + .002 };
}
class HouseCollisionWorld {
  constructor(olam, options = {}) { this.olam = olam || null; this.index = options.index || new SpatialBubbleIndex({ cellSize:options.cellSize || 6 }); this.houses = new Map(); this.colliders = new Map(); this.lastCollision = null; this.measuredProxyCount = 0; this.descriptorProxyCount = 0; this.octreeProxyCount = 0; this.queryRadius = Math.max(1.2, finite(options.queryRadius, 2.2)); this.sidecarOnly = options.sidecarOnly !== false; }
  forgetHouse(root) { const old = root?.uuid ? this.houses.get(root.uuid) : null; if (!old) return; for (const r of old.records || []) { this.index.remove(r.id); this.colliders.delete(r.id); if (r.octreeProxy) this.olam?.worldOctree?.removeMesh?.(r.octreeProxy); } this.houses.delete(root.uuid); }
  addRecord(id, bounds, ref, houseId, proof, records) { this.index.register({ id, kind:"house", layer:0, bounds, houseId, proof }); const record = { id, bounds:bounds.clone(), meshName:ref?.name || null, houseId, proof, octreeProxy:null, sidecarOnly:this.sidecarOnly }; this.colliders.set(id, record); records.push(record); return record; }
  registerHouseRoot(root, options = {}) { if (!root?.isObject3D) return null; this.forgetHouse(root); root.updateWorldMatrix?.(true, true); const houseId = options.houseId || root.userData?.houseId || root.name || root.uuid, records = []; root.traverse?.(child => { if (!solidMesh(child)) return; const b = boundsOf(child); if (!b) return; this.addRecord(`house:${houseId}:mesh:${child.uuid}`, b, child, houseId, { source:"mesh", childName:child.name || null }, records); this.measuredProxyCount++; }); const house = { id:houseId, rootName:root.name || null, records, registeredAt:Date.now(), measured:records.length }; this.houses.set(root.uuid, house); if (this.olam) this.olam.__awtsmoosHouseCollisionWorld = this; return house; }
  querySolidsNear(x = 0, z = 0, r = this.queryRadius) { return this.index.queryCircle(finite(x), finite(z), Math.max(1, finite(r, this.queryRadius)), e => e.kind === "house", { limit:48 }).map(e => this.colliders.get(e.id)).filter(Boolean); }
  resolveCapsule(c, options = {}) { if (!c?.start || !c?.end) return null; const x = (c.start.x + c.end.x) * .5, z = (c.start.z + c.end.z) * .5, body = Math.max(.32, Math.min(.82, finite(options.radius, c.radius || .45))), qr = finite(options.queryRadius, body + 1.1); let best = null; for (const col of this.querySolidsNear(x, z, qr)) { const hit = resolveCapsuleAabb(c, col.bounds, body); if (hit && (!best || hit.depth > best.depth)) best = { ...hit, collider:col }; } if (!best) return null; this.lastCollision = { at:Date.now(), depth:best.depth, normal:{ x:best.normal.x, y:0, z:best.normal.z }, houseId:best.collider.houseId, colliderId:best.collider.id, proof:best.collider.proof, radius:body }; if (this.olam) this.olam.__lastHouseCollision = this.lastCollision; return best; }
  diag() { return { houses:this.houses.size, houseColliders:this.colliders.size, measuredProxies:this.measuredProxyCount, descriptorProxies:this.descriptorProxyCount, octreeProxies:this.octreeProxyCount, sidecarOnly:this.sidecarOnly, lastCollision:this.lastCollision, index:this.index.diag(), seal:"sidecar-only-tight-house-bh2" }; }
}
export default HouseCollisionWorld;
export function ensureHouseCollisionWorld(olam) { if (!olam) return null; if (!olam.__awtsmoosHouseCollisionWorld) olam.__awtsmoosHouseCollisionWorld = new HouseCollisionWorld(olam); return olam.__awtsmoosHouseCollisionWorld; }
export function registerHouseRoot(olam, root, options) { return ensureHouseCollisionWorld(olam)?.registerHouseRoot(root, options) || null; }
