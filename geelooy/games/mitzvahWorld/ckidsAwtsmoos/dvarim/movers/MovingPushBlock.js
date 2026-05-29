// B"H
/**
 * @file MovingPushBlock.js
 * @description
 * Chapter 56: The moving stone learns humility.
 * It stays outside the octree, never steals the static floor's landing, and
 * only acts through its own live AABB: top catch on real top contact, side shove
 * on torso overlap. The Awtsmoos separates moving from still.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

const now = () => (globalThis.performance?.now?.() || Date.now()) / 1000;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const playerPos = p => p?.mesh?.position || p?.modelMesh?.position || null;
const feetY = p => p?.collider?.start ? p.collider.start.y - (Number(p.radius) || 0.45) : (playerPos(p)?.y || 0) - (Number(p?.radius) || 0.45);

function makeBlockTexture() {
  const size = 32, data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const i = (y * size + x) * 4, mortar = x % 8 === 0 || y % 8 === 0, chip = (x * 11 + y * 17) & 31;
    data[i] = mortar ? 224 : 170 + chip; data[i + 1] = mortar ? 206 : 145 + (chip >> 1); data[i + 2] = mortar ? 135 : 82 + (chip >> 2); data[i + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false; tex.repeat.set(2, 2); tex.needsUpdate = true; return tex;
}

/** Dynamic object: not octree, not static floor, only live AABB logic. */
export default class MovingPushBlock extends Domem {
  type = "movingPushBlock";
  heesHawveh = true;

  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.origin = { ...(op.position || { x: 0, y: 0, z: 0 }) };
    this.size = op.size || { x: 3, y: 2.2, z: 1.35 };
    this.axis = op.axis || "z"; this.amplitude = Number(op.amplitude || 2.8); this.speed = Number(op.speed || 1.0);
    this.pushScale = Number(op.pushScale || 1.2); this.topSnap = Number(op.topSnap || 0.42); this._lastPos = null; this.pathBox = this.makePathBox();
  }

  async heescheel(olam) { this.olam = olam; this.mesh = this.makeMesh(); await olam.hoyseef(this); this.isReady = true; }

  makeMesh() {
    const geo = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z, 1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ map: makeBlockTexture(), color: 0xe3c97f });
    const mesh = new THREE.Mesh(geo, mat); mesh.name = this.name || "MovingPushBlock"; mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
    mesh.userData.skipRaycast = true; mesh.userData.addToOctree = false; return mesh;
  }

  makePathBox() {
    const pad = this.amplitude + 1.35;
    return { minX: this.origin.x - this.size.x / 2 - pad, maxX: this.origin.x + this.size.x / 2 + pad, minZ: this.origin.z - this.size.z / 2 - pad, maxZ: this.origin.z + this.size.z / 2 + pad };
  }

  heesHawvoos() {
    if (!this.mesh) return;
    const prev = this._lastPos || this.mesh.position.clone(), offset = Math.sin(now() * this.speed) * this.amplitude;
    this.mesh.position.set(this.origin.x, this.origin.y, this.origin.z); this.mesh.position[this.axis] += offset;
    const delta = this.mesh.position.clone().sub(prev); this._lastPos = this.mesh.position.clone();
    this.catchOnlyRealTopContact(delta); this.shoveOnlyLiveBodyOverlap(delta);
  }

  catchOnlyRealTopContact(delta) {
    const player = this.olam?.chossid, p = playerPos(player), b = this.mesh?.position;
    if (!p || !b || !this.inPath(p) || !this.insideXZ(p, 0.35)) return;
    const top = b.y + this.size.y / 2, fy = feetY(player), falling = !player.velocity || player.velocity.y <= 0.8;
    if (!falling || fy < top - this.topSnap || fy > top + 0.55) return;
    const radius = Number(player.radius) || 0.45, targetStartY = top + radius;
    if (player.collider?.start && player.collider?.end) {
      const lift = targetStartY - player.collider.start.y;
      player.collider.start.y += lift; player.collider.end.y += lift;
      player.collider.start.add(new THREE.Vector3(delta.x, 0, delta.z)); player.collider.end.add(new THREE.Vector3(delta.x, 0, delta.z));
    }
    if (player.velocity) player.velocity.y = 0;
    player.onFloor = true; this.syncPlayerVisuals(player);
  }

  shoveOnlyLiveBodyOverlap(delta) {
    const player = this.olam?.chossid, p = playerPos(player), b = this.mesh?.position;
    if (!p || !b || delta.lengthSq() < 0.000001 || !this.inPath(p)) return;
    const fy = feetY(player), top = b.y + this.size.y / 2, bottom = b.y - this.size.y / 2;
    const torsoOverlaps = this.insideXZ(p, 0.58) && fy < top - 0.2 && p.y > bottom - 0.25;
    if (torsoOverlaps) this.movePlayer(player, delta.clone().multiplyScalar(this.pushScale));
  }

  insideXZ(p, pad = 0) { const b = this.mesh.position; return Math.abs(p.x - b.x) < this.size.x / 2 + pad && Math.abs(p.z - b.z) < this.size.z / 2 + pad; }
  inPath(p) { return p.x >= this.pathBox.minX && p.x <= this.pathBox.maxX && p.z >= this.pathBox.minZ && p.z <= this.pathBox.maxZ; }

  movePlayer(player, delta) {
    player.collider?.start?.add?.(delta); player.collider?.end?.add?.(delta);
    if (player.velocity) { player.velocity.x = clamp((player.velocity.x || 0) + delta.x * 8, -8, 8); player.velocity.z = clamp((player.velocity.z || 0) + delta.z * 8, -8, 8); }
    this.syncPlayerVisuals(player);
  }

  syncPlayerVisuals(player) {
    if (!player.collider?.start) return;
    const radius = Number(player.radius) || 0.45;
    player.mesh?.position?.copy?.(player.collider.start); if (player.mesh) player.mesh.position.y -= radius;
    if (player.modelMesh && player.mesh) player.modelMesh.position.copy(player.mesh.position);
    player.emptyCopy?.position?.copy?.(player.mesh?.position || player.modelMesh?.position); player.nonRotatingEmptyForMovement?.position?.copy?.(player.mesh?.position || player.modelMesh?.position);
  }
}
