// B"H
/**
 * @file MovingPushBlock.js
 * @description
 * Chapter 47: A stone learns to travel and shove.
 * The Awtsmoos moves one simple box along one axis. It does not enter the
 * static octree; it directly carries nearby feet by the previous-frame delta.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

const time = () => (globalThis.performance?.now?.() || Date.now()) / 1000;
function pos(player) { return player?.mesh?.position || player?.modelMesh?.position || null; }

/** One moving block that pushes the player sideways. */
export default class MovingPushBlock extends Domem {
  type = "movingPushBlock";
  heesHawveh = true;

  /** @param {object} op @param {object} olam */
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.origin = { ...(op.position || { x: 0, y: 0, z: 0 }) };
    this.size = op.size || { x: 2, y: 2, z: 1.2 };
    this.axis = op.axis || "z";
    this.amplitude = Number(op.amplitude || 2.8);
    this.speed = Number(op.speed || 1.0);
    this._last = null;
  }

  /** @param {object} olam @returns {Promise<void>} */
  async heescheel(olam) { this.olam = olam; this.mesh = this.makeMesh(); await olam.hoyseef(this); this.isReady = true; }

  /** @returns {THREE.Mesh} */
  makeMesh() {
    const geo = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z, 1, 1, 1);
    const mat = new THREE.MeshLambertMaterial({ color: 0xbba56d, emissive: 0x1e1200 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = this.name || "MovingPushBlock"; mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
    mesh.userData.skipRaycast = true; mesh.userData.addToOctree = false; return mesh;
  }

  /** @returns {void} */
  heesHawvoos() {
    if (!this.mesh) return;
    const next = Math.sin(time() * this.speed) * this.amplitude;
    const prev = this._last ?? next;
    this._last = next;
    this.mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
    this.mesh.position[this.axis] += next;
    this.pushPlayer(next - prev);
  }

  /** @param {number} delta Axis movement since previous frame. @returns {void} */
  pushPlayer(delta) {
    const player = this.olam?.chossid, p = pos(player), b = this.mesh?.position;
    if (!p || !b || Math.abs(delta) < 0.0001) return;
    const hx = this.size.x / 2 + 0.55, hy = this.size.y / 2 + 1.1, hz = this.size.z / 2 + 0.55;
    const inside = Math.abs(p.x - b.x) < hx && Math.abs(p.y - b.y) < hy && Math.abs(p.z - b.z) < hz;
    if (!inside) return;
    p[this.axis] += delta * 1.15;
    if (player.velocity) player.velocity[this.axis] = Math.max(-4, Math.min(4, (player.velocity[this.axis] || 0) + delta * 7));
  }
}
