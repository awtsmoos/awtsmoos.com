// B"H
/**
 * @file SpikedBallHazard.js
 * @description
 * Chapter 47: One dark sun grows thorns and patrols the bridge.
 * The Awtsmoos forges a single BufferGeometry: no child spikes, no swarm,
 * just one jagged sphere breathing through a sine path and one radius check.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

const now = () => (globalThis.performance?.now?.() || Date.now()) / 1000;
function playerPos(player) { return player?.mesh?.position || player?.modelMesh?.position || null; }
function freeze(player, token) {
  Object.assign(player, { __spikeDefeated: true, __spikeDeathControlsFrozen: true, __spikeColliderDisabled: true, __spikeDeathToken: token, moving: {} });
  player.velocity?.set?.(0, 0, 0); player.acceleration?.set?.(0, 0, 0);
}

/** @param {number} rings @param {number} cols @param {number} radius @param {number} spike @returns {THREE.BufferGeometry} */
export function makeSpikedBallGeometry(rings = 10, cols = 18, radius = 0.95, spike = 0.32) {
  const positions = [], normals = [], indices = [];
  for (let y = 0; y <= rings; y += 1) {
    const v = y / rings, theta = v * Math.PI;
    for (let x = 0; x <= cols; x += 1) {
      const u = x / cols, phi = u * Math.PI * 2;
      const thorn = ((x + y) % 3 === 0) ? spike : 0;
      const r = radius + thorn;
      const nx = Math.sin(theta) * Math.cos(phi), ny = Math.cos(theta), nz = Math.sin(theta) * Math.sin(phi);
      positions.push(nx * r, ny * r, nz * r); normals.push(nx, ny, nz);
    }
  }
  for (let y = 0; y < rings; y += 1) for (let x = 0; x < cols; x += 1) {
    const a = y * (cols + 1) + x, b = a + cols + 1;
    indices.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setIndex(indices); geo.computeBoundingSphere(); return geo;
}

/** One moving thorn-star hazard. */
export default class SpikedBallHazard extends Domem {
  type = "spikedBallHazard";
  heesHawveh = true;

  /** @param {object} op @param {object} olam */
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.origin = { ...(op.position || { x: 0, y: 0, z: 0 }) };
    this.axis = op.axis || "x";
    this.amplitude = Number(op.amplitude || 3);
    this.speed = Number(op.speed || 1.2);
    this.radius = Number(op.radius || 1.25);
    this._triggered = false;
  }

  /** @param {object} olam @returns {Promise<void>} */
  async heescheel(olam) {
    this.olam = olam; this.mesh = this.makeMesh(); await olam.hoyseef(this); this.isReady = true;
  }

  /** @returns {THREE.Mesh} */
  makeMesh() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x3a3840, emissive: 0x330000, roughness: 0.65, metalness: 0.18, flatShading: true });
    const mesh = new THREE.Mesh(makeSpikedBallGeometry(10, 18, this.radius * 0.72, this.radius * 0.28), mat);
    mesh.name = this.name || "SpikedBallHazard"; mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
    mesh.userData.skipRaycast = true; mesh.userData.addToOctree = false; return mesh;
  }

  /** @returns {void} */
  heesHawvoos() {
    if (!this.mesh) return;
    const t = now() * this.speed, offset = Math.sin(t) * this.amplitude;
    this.mesh.position.set(this.origin.x, this.origin.y, this.origin.z); this.mesh.position[this.axis] += offset;
    this.mesh.rotation.x += 0.035; this.mesh.rotation.z += 0.052;
    this.checkHit();
  }

  /** @returns {void} */
  checkHit() {
    if (this._triggered || this.olam?.__spikeDeathActive) return;
    const player = this.olam?.chossid, p = playerPos(player), s = this.mesh?.position;
    if (!p || !s || player?.__spikeColliderDisabled) return;
    if (p.distanceTo(s) <= this.radius + 0.52) this.hit(player);
  }

  /** @param {object} player @returns {void} */
  hit(player) {
    this._triggered = true; this.olam.__spikeDeathActive = true;
    const token = (this.olam.__spikeDeathToken || 0) + 1; this.olam.__spikeDeathToken = token; freeze(player, token);
    const payload = { effect: "spikeDeath", reason: "spiked-ball", token, cssOnly: true, text: "כדור קוצים — PRESS ANY KEY TO RESET" };
    globalThis.postMessage?.({ type: "forceSpikeResetOverlay", payload }); this.olam?.ayshPeula?.("ui event", "effectsOverlay", payload);
  }
}
