// B"H
/** Tight cottage collision sidecar. LOD-hidden solid meshes still count. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import SpatialBubbleIndex from "./SpatialBubbleIndex.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const CHILD_BOX = new THREE.Box3();
const LOCAL_BOX = new THREE.Box3();
const LOCAL_MATRIX = new THREE.Matrix4();
const OCTREE_MAT = new THREE.MeshBasicMaterial({ visible:false, transparent:true, opacity:0, depthWrite:false });
const finite = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;

function hasSolidFlag(data = {}, name = "") {
  return Boolean(
    data.cottageWallSection ||
    data.closedCollider ||
    data.isSolid ||
    data.explicitCollision ||
    data.collisionBody ||
    data.cottageBeam ||
    /wall|beam|foundation|roof|floor/i.test(name)
  );
}

function solidMesh(child) {
  if (!child?.isMesh || !child.geometry) return false;
  const d = child.userData || {};
  const n = String(child.name || "");
  if (d.visualOnly || d.cottageVisualOnly || d.cottageWindowGlass || d.softShadow || d.doorPanel) return false;
  if (child.visible === false && !hasSolidFlag(d, n)) return false;
  if (/glass|curtain|banner|laundry|flower|grass|shadow|trim|knob/i.test(n) && !d.closedCollider) return false;
  return hasSolidFlag(d, n);
}

function boundsOf(child) {
  child.updateWorldMatrix?.(true, false);
  child.geometry.computeBoundingBox?.();
  if (!child.geometry.boundingBox) return null;
  CHILD_BOX.copy(child.geometry.boundingBox).applyMatrix4(child.matrixWorld);
  return CHILD_BOX.isEmpty() ? null : CHILD_BOX.clone();
}

function proxyFromBounds(bounds, name) {
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  if (size.x <= 0 || size.y <= 0 || size.z <= 0) return null;
  const proxy = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), OCTREE_MAT.clone());
  proxy.name = name;
  proxy.position.copy(center);
  proxy.updateMatrixWorld(true);
  Object.assign(proxy.userData ||= {}, {
    isSolid:true,
    explicitCollision:true,
    collisionBody:true,
    addToOctree:true,
    skipRaycast:true,
    staticHouseOctreeProxy:true,
    tightMeasuredHouseProxy:true
  });
  return proxy;
}

function octreeEligible(record) {
  const name = `${record?.meshName || ""} ${record?.proof?.childName || ""}`;
  if (/knob|threshold/i.test(name)) return false;
  if (record?.proof?.door && record?.proof?.open === true) return false;
  return true;
}

function descriptorBounds(node, src) {
  if (!Array.isArray(src?.size) || !Array.isArray(src?.position)) return null;
  const sx = Math.max(.01, finite(src.size[0], 1));
  const sy = Math.max(.01, finite(src.size[1], 1));
  const sz = Math.max(.01, finite(src.size[2], 1));
  LOCAL_BOX.min.set(-sx / 2, -sy / 2, -sz / 2);
  LOCAL_BOX.max.set(sx / 2, sy / 2, sz / 2);
  LOCAL_MATRIX.compose(
    new THREE.Vector3(finite(src.position[0]), finite(src.position[1]), finite(src.position[2])),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, finite(src.yaw, 0), 0)),
    new THREE.Vector3(1, 1, 1)
  );
  LOCAL_MATRIX.premultiply(node.matrixWorld);
  CHILD_BOX.copy(LOCAL_BOX).applyMatrix4(LOCAL_MATRIX);
  return CHILD_BOX.isEmpty() ? null : CHILD_BOX.clone();
}

function resolveCapsuleAabb(c, b, radius) {
  const r = Math.max(.01, finite(radius, c?.radius || .45));
  const y0 = Math.min(c.start.y, c.end.y) - r;
  const y1 = Math.max(c.start.y, c.end.y) + r;
  if (y1 < b.min.y || y0 > b.max.y) return null;
  const cx = (c.start.x + c.end.x) * .5;
  const cz = (c.start.z + c.end.z) * .5;
  const qx = Math.max(b.min.x, Math.min(b.max.x, cx));
  const qz = Math.max(b.min.z, Math.min(b.max.z, cz));
  const dx = cx - qx;
  const dz = cz - qz;
  const d2 = dx * dx + dz * dz;
  if (d2 >= r * r) return null;
  if (d2 > 1e-8) {
    const d = Math.sqrt(d2);
    return { normal:new THREE.Vector3(dx / d, 0, dz / d), depth:r - d + .002 };
  }
  const gaps = [Math.abs(cx - b.min.x), Math.abs(b.max.x - cx), Math.abs(cz - b.min.z), Math.abs(b.max.z - cz)];
  const i = gaps.indexOf(Math.min(...gaps));
  return {
    normal:new THREE.Vector3(i === 0 ? -1 : i === 1 ? 1 : 0, 0, i === 2 ? -1 : i === 3 ? 1 : 0),
    depth:Math.min(r, gaps[i]) + .002
  };
}

class HouseCollisionWorld {
  constructor(olam, options = {}) {
    this.olam = olam || null;
    this.index = options.index || new SpatialBubbleIndex({ cellSize:options.cellSize || 6 });
    this.houses = new Map();
    this.colliders = new Map();
    this.lastCollision = null;
    this.measuredProxyCount = 0;
    this.descriptorProxyCount = 0;
    this.floorProxyCount = 0;
    this.exteriorWallProxyCount = 0;
    this.interiorWallProxyCount = 0;
    this.doorProxyCount = 0;
    this.closedDoorBlockers = 0;
    this.broadInvisibleBlockers = 0;
    this.octreeProxyCount = 0;
    this.octreeQueuedCount = 0;
    this.octreeRemovedCount = 0;
    this.octreeDuplicateSkips = 0;
    this.octreeDoorSkips = 0;
    this.recentRegisterSkips = 0;
    this.octreeQueuedIds = new Set();
    this.octreeChunkSize = Math.max(2, Math.min(12, Math.floor(finite(options.octreeChunkSize, 4))));
    this.octreeProxyLimit = Math.max(0, Math.min(260, Math.floor(finite(options.octreeProxyLimit, 140))));
    this.queryRadius = Math.max(1.2, finite(options.queryRadius, 2.2));
    this.sidecarOnly = options.sidecarOnly !== false;
    this.batchId = 0;
  }

  forgetHouse(root) {
    const old = root?.uuid ? this.houses.get(root.uuid) : null;
    if (!old) return;
    for (const r of old.records || []) {
      this.index.remove(r.id);
      this.colliders.delete(r.id);
      this.octreeQueuedIds.delete(r.id);
      if (r.octreeProxy) {
        this.olam?.worldOctree?.removeMesh?.(r.octreeProxy);
        this.octreeRemovedCount++;
        this.octreeProxyCount = Math.max(0, this.octreeProxyCount - 1);
      }
    }
    this.houses.delete(root.uuid);
  }

  addRecord(id, bounds, ref, houseId, proof, records) {
    this.index.register({ id, kind:"house", layer:0, bounds, houseId, proof });
    const record = { id, bounds:bounds.clone(), meshName:ref?.name || null, houseId, proof, solid:proof?.solid !== false, octreeProxy:null, sidecarOnly:true };
    this.colliders.set(id, record);
    records.push(record);
    return record;
  }

  addDescriptorRecord(node, src, houseId, records) {
    if (!src || src.solid === false && !src.floor) return null;
    if (src.door && src.open === true) return null;
    const bounds = descriptorBounds(node, src);
    if (!bounds) return null;
    const category = src.category || "descriptor";
    const proof = {
      source:"descriptor",
      childName:node.name || null,
      descriptorId:src.id || null,
      category,
      solid:src.solid !== false,
      floor:Boolean(src.floor),
      door:Boolean(src.door),
      open:Boolean(src.open),
      interiorWall:Boolean(src.interiorPartition || category === "cottage-room-wall"),
      exteriorWall:Boolean(src.actualSolidWall || category === "cottage-wall")
    };
    const record = this.addRecord(`house:${houseId}:descriptor:${src.id || node.uuid}:${records.length}`, bounds, node, houseId, proof, records);
    this.descriptorProxyCount++;
    if (proof.floor) this.floorProxyCount++;
    if (proof.exteriorWall) this.exteriorWallProxyCount++;
    if (proof.interiorWall) this.interiorWallProxyCount++;
    if (proof.door) {
      this.doorProxyCount++;
      if (proof.solid) this.closedDoorBlockers++;
    }
    return record;
  }

  queueOctreeProxies(records, houseId) {
    if (!this.olam?.worldOctree || !records?.length || this.octreeProxyLimit <= 0) return;
    const queue = [];
    for (const record of records) {
      if (queue.length >= this.octreeProxyLimit) break;
      if (!octreeEligible(record)) {
        this.octreeDoorSkips++;
        continue;
      }
      if (this.octreeQueuedIds.has(record.id)) {
        this.octreeDuplicateSkips++;
        continue;
      }
      this.octreeQueuedIds.add(record.id);
      queue.push(record.id);
    }
    this.octreeQueuedCount += queue.length;
    const pump = () => {
      const chunk = queue.splice(0, this.octreeChunkSize);
      for (const id of chunk) {
        const record = this.colliders.get(id);
        if (!record || record.octreeProxy) continue;
        const proxy = proxyFromBounds(record.bounds, `${record.id}:tight_octree_proxy`);
        if (!proxy) continue;
        proxy.userData.houseId = houseId;
        proxy.userData.houseColliderId = record.id;
        const ok = Boolean(this.olam.worldOctree.addObject(proxy));
        if (ok) {
          record.octreeProxy = proxy;
          record.sidecarOnly = false;
          this.octreeProxyCount++;
        }
      }
      if (queue.length) setTimeout(pump, 80);
    };
    setTimeout(pump, 0);
  }

  registerHouseRoot(root, options = {}) {
    if (!root?.isObject3D) return null;
    const old = root.uuid ? this.houses.get(root.uuid) : null;
    const now = Date.now();
    if (old && !options.forceRefresh && now - (old.registeredAt || 0) < 2500) {
      this.recentRegisterSkips++;
      return old;
    }
    this.forgetHouse(root);
    root.updateWorldMatrix?.(true, true);
    const houseId = options.houseId || root.userData?.houseId || root.name || root.uuid;
    const records = [];
    root.traverse?.(child => {
      const data = child.userData || {};
      if (data.broadInvisibleHouseBlocker) this.broadInvisibleBlockers++;
      const sources = Array.isArray(data.colliderSources) ? data.colliderSources : [];
      sources.forEach(src => this.addDescriptorRecord(child, src, houseId, records));
      if (!solidMesh(child)) return;
      const b = boundsOf(child);
      if (!b) return;
      this.addRecord(`house:${houseId}:mesh:${child.uuid}`, b, child, houseId, {
        source:"measured-mesh-bounds",
        generatedFrom:"child-mesh-world-bounds",
        childName:child.name || null,
        solid:true,
        lodHidden:child.visible === false
      }, records);
      this.measuredProxyCount++;
    });
    const house = { id:houseId, rootName:root.name || null, records, registeredAt:now, measured:records.length };
    this.houses.set(root.uuid, house);
    if (this.olam) this.olam.__awtsmoosHouseCollisionWorld = this;
    if (options.octree === true) this.queueOctreeProxies(records, houseId);
    return house;
  }

  querySolidsNear(x = 0, z = 0, r = this.queryRadius) {
    return this.index
      .queryCircle(finite(x), finite(z), Math.max(1, finite(r, this.queryRadius)), e => e.kind === "house", { limit:48 })
      .map(e => this.colliders.get(e.id))
      .filter(Boolean);
  }

  resolveCapsule(c, options = {}) {
    if (!c?.start || !c?.end) return null;
    const x = (c.start.x + c.end.x) * .5;
    const z = (c.start.z + c.end.z) * .5;
    const body = Math.max(.32, Math.min(.82, finite(options.radius, c.radius || .45)));
    const qr = finite(options.queryRadius, body + 1.1);
    let best = null;
    for (const col of this.querySolidsNear(x, z, qr)) {
      if (col.solid === false) continue;
      const hit = resolveCapsuleAabb(c, col.bounds, body);
      if (hit && (!best || hit.depth > best.depth)) best = { ...hit, collider:col };
    }
    if (!best) return null;
    this.lastCollision = {
      at:Date.now(),
      depth:best.depth,
      normal:{ x:best.normal.x, y:0, z:best.normal.z },
      houseId:best.collider.houseId,
      colliderId:best.collider.id,
      proof:best.collider.proof,
      radius:body
    };
    if (this.olam) this.olam.__lastHouseCollision = this.lastCollision;
    return best;
  }

  diag() {
    return {
      houses:this.houses.size,
      houseColliders:this.colliders.size,
      measuredProxies:this.colliders.size,
      measuredProxiesLifetime:this.measuredProxyCount,
      descriptorProxies:this.descriptorProxyCount,
      floorProxyCount:this.floorProxyCount,
      exteriorWallProxyCount:this.exteriorWallProxyCount,
      interiorWallProxyCount:this.interiorWallProxyCount,
      wallProxyCount:this.exteriorWallProxyCount + this.interiorWallProxyCount,
      doorProxyCount:this.doorProxyCount,
      closedDoorBlockers:this.closedDoorBlockers,
      broadInvisibleBlockers:this.broadInvisibleBlockers,
      octreeProxies:this.octreeProxyCount,
      octreeQueued:this.octreeQueuedCount,
      octreeRemoved:this.octreeRemovedCount,
      octreeDuplicateSkips:this.octreeDuplicateSkips,
      octreeDoorSkips:this.octreeDoorSkips,
      recentRegisterSkips:this.recentRegisterSkips,
      octreeChunkSize:this.octreeChunkSize,
      octreeProxyLimit:this.octreeProxyLimit,
      sidecarOnly:this.sidecarOnly,
      sidecarAuthoritative:true,
      octreeRegistered:this.octreeQueuedCount > 0 || this.octreeProxyCount > 0,
      octreeRebuildEveryFrame:false,
      lastCollision:this.lastCollision,
      index:this.index.diag(),
      lodHiddenSolidsPreserved:true,
      seal:"tight-house-octree-proxies-lod-hidden-bh2"
    };
  }
}

export default HouseCollisionWorld;

export function ensureHouseCollisionWorld(olam) {
  if (!olam) return null;
  if (!olam.__awtsmoosHouseCollisionWorld) olam.__awtsmoosHouseCollisionWorld = new HouseCollisionWorld(olam);
  return olam.__awtsmoosHouseCollisionWorld;
}

export function registerHouseRoot(olam, root, options) {
  return ensureHouseCollisionWorld(olam)?.registerHouseRoot(root, options) || null;
}
