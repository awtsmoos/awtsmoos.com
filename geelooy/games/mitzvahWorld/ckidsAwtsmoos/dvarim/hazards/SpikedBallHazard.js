// B"H
/**
 * @file SpikedBallHazard.js
 * @description Chapter 63: the lava globe is not a red balloon anymore. It
 * carries a procedural black-crust/orange-vein texture with MeshBasicMaterial so
 * mobile lighting cannot flatten it. Collision stays exact squared-sphere math.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

const now = () => (globalThis.performance?.now?.() || Date.now()) / 1000;
const playerPos = player => player?.mesh?.position || player?.modelMesh?.position || null;
const clamp = value => Math.max(0, Math.min(255, Math.round(value)));

/** @param {object} root Visual root. @param {boolean} visible Visibility. */
function show(root, visible) { if (root) root.visible = visible; }

/** @param {object} player Chossid-like player. @param {number} token Death token. */
function freeze(player, token) {
  Object.assign(player, { __spikeDefeated: true, __spikeDeathControlsFrozen: true, __spikeColliderDisabled: true, __spikeDeathToken: token, moving: {} });
  player.velocity?.set?.(0, 0, 0);
  player.acceleration?.set?.(0, 0, 0);
}

/** @returns {THREE.DataTexture} Strong visible molten crust texture. */
function lavaTexture() {
  const size = 96;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const i = (y * size + x) * 4;
    const vein = Math.sin(x * 0.34) + Math.cos(y * 0.29) + Math.sin((x - y) * 0.18);
    const crack = x % 17 < 1 || y % 19 < 1 || ((x + y) % 29 < 1);
    const ember = ((x * 13 + y * 23) & 63) > 54;
    const hot = crack || vein > 1.1 || ember;
    data[i] = hot ? 255 : clamp(56 + vein * 18);
    data[i + 1] = hot ? clamp(118 + vein * 22) : clamp(18 + vein * 8);
    data[i + 2] = hot ? clamp(18 + vein * 4) : 4;
    data[i + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.repeat.set(2.2, 1.55);
  tex.needsUpdate = true;
  return tex;
}

/** Moving lava-globe hazard with squared sphere collision. */
export default class SpikedBallHazard extends Domem {
  type = "spikedBallHazard";
  heesHawveh = true;

  /** @param {object} op Authored JSON. @param {object} olam Runtime world. */
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.origin = { ...(op.position || { x: 0, y: 0, z: 0 }) };
    this.axis = op.axis || "x";
    this.amplitude = Number(op.amplitude || 2.2);
    this.speed = Number(op.speed || 1.1);
    this.radius = Number(op.radius || 0.9);
    this.hitRadius = Number(op.hitRadius || this.radius * 0.72);
    this._triggered = false;
  }

  /** @param {object} olam Runtime world. @returns {Promise<void>} */
  async heescheel(olam) {
    this.olam = olam;
    this.mesh = this.makeMesh();
    await olam.hoyseef(this);
    this.isReady = true;
  }

  /** @returns {THREE.Mesh} Efficient textured lava globe mesh. */
  makeMesh() {
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: lavaTexture() });
    const geometry = new THREE.SphereGeometry(this.radius, 24, 16);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = this.name || "TexturedLavaGlobeHazard";
    mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
    mesh.userData.skipRaycast = true;
    mesh.userData.addToOctree = false;
    return mesh;
  }

  /** @returns {void} Moves and checks collision. */
  heesHawvoos() {
    if (!this.mesh) return;
    const offset = Math.sin(now() * this.speed) * this.amplitude;
    this.mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
    this.mesh.position[this.axis] += offset;
    this.mesh.rotation.x += 0.031;
    this.mesh.rotation.z += 0.047;
    if (this.mesh.material?.map) this.mesh.material.map.offset.x = (this.mesh.material.map.offset.x + 0.006) % 1;
    this.checkHit();
  }

  /** @returns {void} Squared globe collision, no sqrt. */
  checkHit() {
    if (this._triggered || this.olam?.__spikeDeathActive) return;
    const player = this.olam?.chossid, p = playerPos(player), s = this.mesh?.position;
    if (!p || !s || player?.__spikeColliderDisabled) return;
    const r = this.hitRadius + Number(player?.radius || 0.45) * 0.55;
    const dx = p.x - s.x, dy = p.y - s.y, dz = p.z - s.z;
    if (dx * dx + dy * dy + dz * dz <= r * r) this.hit(player);
  }

  /** @param {object} player Chossid-like player. @returns {void} */
  hit(player) {
    this._triggered = true;
    this.olam.__spikeDeathActive = true;
    const token = (this.olam.__spikeDeathToken || 0) + 1;
    this.olam.__spikeDeathToken = token;
    freeze(player, token);
    setTimeout(() => this.hidePlayer(player, token), 90);
    const payload = { effect: "spikeDeath", reason: "lava-globe", token, cssOnly: true, overlayDelayMs: 3000, text: "LAVA GLOBE - HIT ANY KEY TO CONTINUE" };
    globalThis.postMessage?.({ type: "forceSpikeResetOverlay", payload });
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", payload);
  }

  /** @param {object} player Chossid-like player. @param {number} token Death token. */
  hidePlayer(player, token) {
    if (player.__spikeDeathToken !== token) return;
    show(player.modelMesh, false);
    show(player.visualObject, false);
    show(player.guf, false);
    show(player.mesh, false);
  }
}
