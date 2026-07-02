// B"H
/** House collision world: descriptor solids are authoritative, live doors re-register. */
import * as THREE from "/games/scripts/build/three.module.js";
import SpatialBubbleIndex from "./SpatialBubbleIndex.js";
const BOX = new THREE.Box3(), CHILD_BOX = new THREE.Box3(), TEMP = new THREE.Vector3(), MAT = new THREE.Matrix4(), YAW = new THREE.Matrix4();
const finite = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
function solidMesh(child) {
  if (!child?.isMesh || !child.geometry || child.visible === false) return false;
  const d = child.userData || {}, n = String(child.name || "");
  if (d.visualOnly || d.cottageWindowGlass || d.softShadow || d.doorPanel) return false;
  if (/glass|curtain|banner|laundry|flower|grass|shadow|trim|knob/i.test(n) && !d.closedCollider) return false;
  return Boolean(d.cottageWallSection || d.closedCollider || d.isSolid || d.explicitCollision || d.collisionBody || d.cottageBeam || /wall|collider|beam|foundation|roof|floor/i.test(n));
}
function boundsOf(child) {
  child.updateWorldMatrix?.(true, false); child.geometry.computeBoundingBox?.();
  if (!child.geometry.boundingBox) return null;
  CHILD_BOX.copy(child.geometry.boundingBox).applyMatrix4(child.matrixWorld);
  return CHILD_BOX.isEmpty() ? null : CHILD_BOX.clone();
}
function descriptorBounds(src, owner) {
  const p = src?.position, s = src?.size; if (!Array.isArray(p) || !Array.isArray(s)) return null;
  const hx = Math.abs(finite(s[0])) / 2, hy = Math.abs(finite(s[1])) / 2, hz = Math.abs(finite(s[2])) / 2;
  if (!hx || !hy || !hz) return null;
  YAW.makeRotationY(finite(src.yaw)); MAT.copy(owner.matrixWorld || new THREE.Matrix4()).multiply(YAW); BOX.makeEmpty();
  for (const x of [-hx, hx]) for (const y of [-hy, hy]) for (const z of [-hz, hz]) {
    TEMP.set(finite(p[0]) + x, finite(p[1]) + y, finite(p[2]) + z).applyMatrix4(MAT); BOX.expandByPoint(TEMP);
  }
  BOX.expandByScalar(finite(src.skin, .08)); return BOX.isEmpty() ? null : BOX.clone();
}
function resolveCapsuleAabb(c, b) {
  if (!c?.start || !c?.end) return null;
  const r = Math.max(.01, finite(c.radius, .45)), y0 = Math.min(c.start.y, c.end.y) - r, y1 = Math.max(c.start.y, c.end.y) + r;
  if (y1 < b.min.y || y0 > b.max.y) return null;
  const cx = (c.start.x + c.end.x) * .5, cz = (c.start.z + c.end.z) * .5;
  const qx = Math.max(b.min.x, Math.min(b.max.x, cx)), qz = Math.max(b.min.z, Math.min(b.max.z, cz));
  let dx = cx - qx, dz = cz - qz, d2 = dx * dx + dz * dz;
  if (d2 >= r * r) return null;
  if (d2 > 1e-8) { const d = Math.sqrt(d2); return { normal:new THREE.Vector3(dx / d, 0, dz / d), depth:r - d + .002 }; }
  const gaps = [Math.abs(cx - b.min.x), Math.abs(b.max.x - cx), Math.abs(cz - b.min.z), Math.abs(b.max.z - cz)];
  const i = gaps.indexOf(Math.min(...gaps));
  return { normal:new THREE.Vector3(i === 0 ? -1 : i === 1 ? 1 : 0, 0, i === 2 ? -1 : i === 3 ? 1 : 0), depth:r + gaps[i] + .002 };
}
export default class HouseCollisionWorld {
  constructor(olam, options = {}) { this.olam = olam || null; this.index = options.index || new SpatialBubbleIndex({ cellSize:options.cellSize || 8 }); this.houses = new Map(); this.colliders = new Map(); this.lastCollision = null; this.measuredProxyCount = 0; this.descriptorProxyCount = 0; this.queryRadius = Math.max(6, finite(options.queryRadius, 14)); }
  forgetHouse(root) { const old = root?.uuid ? this.houses.get(root.uuid) : null; if (!old) return; for (const r of old.records || []) { this.index.remove(r.id); this.colliders.delete(r.id); } this.houses.delete(root.uuid); }
  addRecord(id, bounds, ref, houseId, proof, records) { this.index.register({ id, kind:"house", layer:0, bounds, ref, houseId, proof }); const record = { id, bounds:bounds.clone(), mesh:ref, houseId, proof }; this.colliders.set(id, record); records.push(record); return record; }
  registerHouseRoot(root, options = {}) {
    if (!root?.isObject3D) return null; this.forgetHouse(root); root.updateWorldMatrix?.(true, true);
    const houseId = options.houseId || root.userData?.houseId || root.name || root.uuid, records = [];
    root.traverse?.(child => {
      if (solidMesh(child)) { const b = boundsOf(child); if (b) { this.addRecord(`house:${houseId}:mesh:${child.uuid}`, b, child, houseId, { source:"mesh", childName:child.name || null }, records); this.measuredProxyCount++; } }
      const sources = child.userData?.colliderSources;
      if (Array.isArray(sources)) sources.forEach((src, i) => { if (src?.solid === false || src?.open === true) return; const b = descriptorBounds(src, child); if (b) { this.addRecord(`house:${houseId}:descriptor:${src.id || child.uuid + ":" + i}`, b, child, houseId, { source:"descriptor", descriptorId:src.id || null, category:src.category || null }, records); this.descriptorProxyCount++; } });
    });
    const house = { id:houseId, root, records, registeredAt:Date.now(), measured:records.length }; this.houses.set(root.uuid, house); if (this.olam) this.olam.__awtsmoosHouseCollisionWorld = this; return house;
  }
  registerKnownHouseRoots(roots = []) { return (roots || []).map(r => this.registerHouseRoot(r)).filter(Boolean); }
  querySolidsNear(x = 0, z = 0, r = this.queryRadius) { return this.index.queryCircle(finite(x), finite(z), finite(r), e => e.kind === "house", { limit:256 }).map(e => this.colliders.get(e.id)).filter(Boolean); }
  resolveCapsule(c, options = {}) {
    if (!c?.start || !c?.end) return null;
    const x = (c.start.x + c.end.x) * .5, z = (c.start.z + c.end.z) * .5, r = finite(options.radius, this.queryRadius + finite(c.radius, .45));
    let best = null; for (const col of this.querySolidsNear(x, z, r)) { const hit = resolveCapsuleAabb(c, col.bounds); if (hit && (!best || hit.depth > best.depth)) best = { ...hit, collider:col }; }
    if (!best) return null;
    this.lastCollision = { at:Date.now(), depth:best.depth, normal:{ x:best.normal.x, y:0, z:best.normal.z }, source:best.collider.proof?.source || "house", houseId:best.collider.houseId, colliderId:best.collider.id, proof:best.collider.proof };
    if (this.olam) this.olam.__lastHouseCollision = this.lastCollision; return best;
  }
  diag() { return { houses:this.houses.size, houseColliders:this.colliders.size, measuredProxies:this.measuredProxyCount, descriptorProxies:this.descriptorProxyCount, lastCollision:this.lastCollision, index:this.index.diag() }; }
}
export function ensureHouseCollisionWorld(olam) { if (!olam) return null; if (!olam.__awtsmoosHouseCollisionWorld) olam.__awtsmoosHouseCollisionWorld = new HouseCollisionWorld(olam); return olam.__awtsmoosHouseCollisionWorld; }
export function registerHouseRoot(olam, root, options) { return ensureHouseCollisionWorld(olam)?.registerHouseRoot(root, options) || null; }
