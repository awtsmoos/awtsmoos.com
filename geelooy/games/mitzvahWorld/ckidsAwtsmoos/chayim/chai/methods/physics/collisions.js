// B"H
/**
 * collisions.js
 *
 * Chapter 100: a wall is not a curse, it is a letter. The Awtsmoos lets the
 * chossid meet house, fence, tree, terrain, and sealed boundary with a readable
 * name, then slide along the tangent instead of jittering against the decree.
 */
const WALL_STEP_HEIGHT = 0.2;
const MAX_WALL_SOLVES = 4;
const MIN_WALL_DEPTH = 1e-8;
const MIN_HORIZONTAL_NORMAL = 1e-6;
const SKIN = 0.0025;
const LOG_LIMIT = 80;

function finiteCollision(result) {
  return result && Number.isFinite(result.depth)
    && Number.isFinite(result.normal?.x)
    && Number.isFinite(result.normal?.y)
    && Number.isFinite(result.normal?.z);
}

function finiteCapsule(collider) {
  const pts = [collider?.start, collider?.end];
  return pts.every(p => p && Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z));
}

function playerPos(self) {
  return self?.mesh?.position || self?.position || self?.modelMesh?.position || null;
}

function hitObject(result) {
  return result?.object || result?.mesh || result?.triangle?.object || result?.collider || null;
}

function lower(value) { return String(value || "").toLowerCase(); }

function hasHouseMark(obj, data) {
  return Boolean(data.isVillageHouseCollider || data.houseCollider || data.colliderOwner
    || lower(data.colliderKind).includes("house") || lower(data.colliderRole).includes("house")
    || lower(obj?.name).includes("house_") || lower(obj?.name).includes("house"));
}

function roleOf(obj, data) {
  return data.colliderRole || data.slabName || data.sourceName || obj?.name || "wall";
}

function ownerOf(result) {
  const obj = hitObject(result), data = obj?.userData || {}, role = roleOf(obj, data);
  const isHouse = hasHouseMark(obj, data);
  const kind = isHouse ? "house" : data.colliderKind || data.kind || data.ownerKind
    || (data.isTreeTrunkCollider ? "tree-trunk" : data.parcelCollider ? "parcel"
      : data.fenceCollider ? "fence" : data.terrainCollider ? "terrain" : "unknown");
  return {
    name: data.colliderOwner || data.ownerName || data.name || obj?.name || "unknown-octree-collider",
    kind,
    category: isHouse ? "house" : kind,
    colliderName: obj?.name || data.name || "unknown-collider-mesh",
    colliderRole: role,
    house: isHouse,
    userData: data
  };
}

function ringPush(owner, key, payload, max = LOG_LIMIT) {
  owner[key] ||= [];
  owner[key].push(payload);
  if (owner[key].length > max) owner[key].splice(0, owner[key].length - max);
}

function emitWallDebug(self, result, dirX, dirZ) {
  if (!self?.olam) return;
  const p = playerPos(self), owner = ownerOf(result);
  const payload = {
    at: Date.now(), owner: owner.name, kind: owner.kind, category: owner.category,
    colliderName: owner.colliderName, colliderRole: owner.colliderRole, role: owner.colliderRole,
    house: owner.house, depth: result.depth,
    normal: { x: dirX, y: result.normal.y, z: dirZ },
    position: p ? { x: p.x, y: p.y, z: p.z } : null
  };
  self.olam.__lastCollision = payload;
  self.olam.__lastInvisibleWallHit = payload;
  ringPush(self.olam, "__collisionLog", payload, LOG_LIMIT);
  ringPush(self.olam, "__wallHitHistory", payload, LOG_LIMIT);
  if (payload.house) {
    self.olam.__lastHouseCollision = payload;
    ringPush(self.olam, "__houseCollisionLog", payload, LOG_LIMIT);
  }
  if (self.olam.__AWTSMOOS_SHOW_COLLIDER_DEBUG__ || globalThis.__AWTSMOOS_SHOW_COLLIDER_DEBUG__) {
    const label = payload.house ? `HOUSE ${payload.owner}:${payload.colliderRole}` : `${payload.kind}:${payload.owner}:${payload.colliderRole}`;
    self.olam?.ayshPeula?.("ui event", "combatLog", { text: `${label} depth=${Number(payload.depth).toFixed(3)}`, category: "Collider" });
  }
}

function slideVelocity(self, dirX, dirZ) {
  const vx = Number(self.velocity.x) || 0, vz = Number(self.velocity.z) || 0;
  const intoWall = vx * dirX + vz * dirZ;
  if (!Number.isFinite(intoWall) || intoWall >= 0) return;
  self.velocity.x = vx - dirX * intoWall;
  self.velocity.z = vz - dirZ * intoWall;
}

function solveWall(self, result) {
  if (result.normal.y >= 0.15 || result.depth < MIN_WALL_DEPTH) return false;
  const nx = result.normal.x, nz = result.normal.z, lenSq = nx * nx + nz * nz;
  if (!Number.isFinite(lenSq) || lenSq <= MIN_HORIZONTAL_NORMAL) return false;
  const len = Math.sqrt(lenSq), dirX = nx / len, dirZ = nz / len;
  if (!Number.isFinite(dirX) || !Number.isFinite(dirZ)) return false;
  self._frameWallNormals ||= [];
  self._frameWallNormals.push({ x: dirX, z: dirZ });
  emitWallDebug(self, result, dirX, dirZ);
  slideVelocity(self, dirX, dirZ);
  const depth = Math.max(0, Number(result.depth) || 0) + SKIN;
  const push = { x: dirX * depth, y: 0, z: dirZ * depth };
  if (Number.isFinite(push.x) && Number.isFinite(push.z)) self.collider.translate(push);
  return true;
}

export default {
  collisions() {
    if (!this.olam?.worldOctree || !this.collider || !this.velocity || !finiteCapsule(this.collider)) return;
    this._frameWallNormals = [];
    this.collider.start.y += WALL_STEP_HEIGHT;
    this.collider.end.y += WALL_STEP_HEIGHT;
    for (let i = 0; i < MAX_WALL_SOLVES; i += 1) {
      const result = this.olam.worldOctree.capsuleIntersect(this.collider);
      if (!result || !finiteCollision(result)) break;
      if (!solveWall(this, result)) break;
    }
    this.collider.start.y -= WALL_STEP_HEIGHT;
    this.collider.end.y -= WALL_STEP_HEIGHT;
  }
};
