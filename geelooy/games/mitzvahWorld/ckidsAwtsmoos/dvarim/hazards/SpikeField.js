// B"H
/**
 * @file SpikeField.js
 * @description
 * Chapter 50: The lava receives a real texture without angering WebGL.
 * The Awtsmoos paints a tiny power-of-two RGBA scroll-texture: no GL_RGB,
 * no shader, no render-target mystery, just one safe image flowing on one mesh.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

const PAD = 0.15;
const FEET_PAD = 0.2;
const now = () => (globalThis.performance?.now?.() || Date.now()) / 1000;

/** @returns {THREE.DataTexture} */
function makeLavaTexture() {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const i = (y * size + x) * 4;
    const hash = (x * 19 + y * 23 + ((x ^ y) * 7)) & 63;
    const vein = hash < 10 || ((x + y * 2) & 15) === 0;
    data[i] = vein ? 255 : 185 + (hash >> 1);
    data[i + 1] = vein ? 205 : 42 + (hash >> 2);
    data[i + 2] = vein ? 36 : 0;
    data[i + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.flipY = false;
  texture.repeat.set(18, 8);
  texture.needsUpdate = true;
  return texture;
}

export function boundsFromPoints(points = []) {
  if (!points.length) return { minX: -45, maxX: 75, minZ: -35, maxZ: 35 };
  return points.reduce((b, p) => ({
    minX: Math.min(b.minX, Number(p.x) || 0),
    maxX: Math.max(b.maxX, Number(p.x) || 0),
    minZ: Math.min(b.minZ, Number(p.z) || 0),
    maxZ: Math.max(b.maxZ, Number(p.z) || 0)
  }), { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity });
}

export function paddedBox(b, pad = PAD) {
  const minX = b.minX - pad, maxX = b.maxX + pad, minZ = b.minZ - pad, maxZ = b.maxZ + pad;
  return { minX, maxX, minZ, maxZ, cx: (minX + maxX) / 2, cz: (minZ + maxZ) / 2, width: maxX - minX, depth: maxZ - minZ };
}

function pos(player) { return player?.mesh?.position || player?.modelMesh?.position || null; }
function feetY(player) {
  if (player?.collider?.start) return player.collider.start.y - (Number(player.radius) || 0.45);
  const p = pos(player);
  return Number.isFinite(p?.y) ? p.y - (Number(player?.radius) || 0.45) : NaN;
}
function frozen(player) { return !player || player.__spikeDefeated || player.__spikeDeathControlsFrozen || player.__spikeColliderDisabled; }
function show(root, isVisible) { if (root) root.visible = isVisible; }
function freeze(player, token) {
  Object.assign(player, { __spikeDefeated: true, __spikeDeathControlsFrozen: true, __spikeColliderDisabled: true, __spikeDeathToken: token, moving: {} });
  player.velocity?.set?.(0, 0, 0);
  player.acceleration?.set?.(0, 0, 0);
}

/** One molten floor, one safe RGBA texture, one AABB. */
export default class SpikeField extends Domem {
  type = "spikeField";
  heesHawveh = true;

  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.height = Number(op.height || 0.42);
    this.groundY = Number(op.groundY ?? -3);
    this.box = paddedBox(op.bounds || boundsFromPoints(op.spikes || []), Number(op.pad ?? PAD));
    this._triggered = false;
    this.texture = null;
  }

  async heescheel(olam) {
    this.olam = olam;
    this.mesh = this.makeMesh();
    await olam.hoyseef(this);
    this.isReady = true;
  }

  makeMesh() {
    this.texture = makeLavaTexture();
    const material = new THREE.MeshBasicMaterial({ map: this.texture, color: 0xff6a20 });
    const geometry = new THREE.BoxGeometry(this.box.width, this.height, this.box.depth, 1, 1, 1);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `${this.name || "LavaField"}_Safe_RGBA_Texture`;
    mesh.position.set(this.box.cx, this.groundY + this.height / 2, this.box.cz);
    mesh.frustumCulled = true;
    mesh.userData.skipRaycast = true;
    mesh.userData.addToOctree = false;
    return mesh;
  }

  heesHawvoos() {
    if (this.texture) {
      const t = now();
      this.texture.offset.set((t * 0.025) % 1, (t * 0.012) % 1);
    }
    if (this._triggered || this.olam?.__spikeDeathActive) return;
    const player = this.olam?.chossid, p = pos(player), fy = feetY(player);
    if (frozen(player) || !p || !Number.isFinite(fy)) return;
    if (this.containsXZ(p) && this.containsFeet(fy)) this.hit(player);
  }

  containsXZ(p) { return p.x >= this.box.minX && p.x <= this.box.maxX && p.z >= this.box.minZ && p.z <= this.box.maxZ; }
  containsFeet(y) { return y >= this.groundY - 0.35 && y <= this.groundY + this.height + FEET_PAD; }
  hit(player) { this._triggered = true; this.olam.__spikeDeathActive = true; const token = (this.olam.__spikeDeathToken || 0) + 1; this.olam.__spikeDeathToken = token; freeze(player, token); this.overlay(player, token); setTimeout(() => this.hidePlayer(player, token), 90); }
  hidePlayer(player, token) { if (player.__spikeDeathToken !== token) return; show(player.modelMesh, false); show(player.visualObject, false); show(player.guf, false); show(player.mesh, false); }
  overlay(player, token) { const p = pos(player); const payload = { effect: "spikeDeath", reason: "lava-floor", token, cssOnly: true, text: "נפילה בלבה — PRESS ANY KEY TO RESET", worldPosition: p ? { x: p.x, y: p.y, z: p.z } : null }; globalThis.postMessage?.({ type: "forceSpikeResetOverlay", payload }); this.olam?.ayshPeula?.("ui event", "effectsOverlay", payload); }
  resetField() { this._triggered = false; }
}
