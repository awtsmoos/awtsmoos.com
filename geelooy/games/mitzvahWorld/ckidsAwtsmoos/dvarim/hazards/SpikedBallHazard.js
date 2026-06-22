// B"H
/**
 * @file SpikedBallHazard.js
 * @description
 * Chapter 163: Lava globes keep texture without burning the whole scene white.
 *
 * These hazards stay visually molten, but the palette is now dark crust with
 * amber veins and Lambert lighting. Collision remains exact squared-sphere math.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

const now = () => (globalThis.performance?.now?.() || Date.now()) / 1000;
const playerPos = player => player?.mesh?.position || player?.modelMesh?.position || null;
const clamp = value => Math.max(0, Math.min(255, Math.round(value)));
function show(root, visible) { if (root) root.visible = visible; }
function freeze(player, token) { Object.assign(player, { __spikeDefeated: true, __spikeDeathControlsFrozen: true, __spikeColliderDisabled: true, __spikeDeathToken: token, moving: {} }); player.velocity?.set?.(0, 0, 0); player.acceleration?.set?.(0, 0, 0); }

function lavaTexture() {
  const size = 96;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const i = (y * size + x) * 4;
    const vein = Math.sin(x * 0.34) + Math.cos(y * 0.29) + Math.sin((x - y) * 0.18);
    const crack = x % 23 < 1 || y % 29 < 1 || ((x + y) % 37 < 1);
    const ember = ((x * 13 + y * 23) & 63) > 58;
    const hot = crack || vein > 1.35 || ember;
    data[i] = hot ? 205 : clamp(42 + vein * 12);
    data[i + 1] = hot ? clamp(78 + vein * 12) : clamp(14 + vein * 6);
    data[i + 2] = hot ? clamp(14 + vein * 3) : 3;
    data[i + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.wrapS = THREE.MirroredRepeatWrapping;
  tex.wrapT = THREE.MirroredRepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.repeat.set(2.2, 1.55);
  tex.needsUpdate = true;
  return tex;
}

export default class SpikedBallHazard extends Domem {
  type = "spikedBallHazard";
  heesHawveh = true;

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

  async heescheel(olam) {
    this.olam = olam;
    this.mesh = this.makeMesh();
    await olam.hoyseef(this);
    this.isReady = true;
  }

  makeMesh() {
    const material = new THREE.MeshLambertMaterial({ color: 0x8d3818, map: lavaTexture(), emissive: 0x160300 });
    const geometry = new THREE.SphereGeometry(this.radius, 24, 16);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = this.name || "ReadableLavaGlobeHazard";
    mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
    mesh.userData.skipRaycast = true;
    mesh.userData.addToOctree = false;
    return mesh;
  }

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

  checkHit() {
    if (this._triggered || this.olam?.__spikeDeathActive) return;
    const player = this.olam?.chossid, p = playerPos(player), s = this.mesh?.position;
    if (!p || !s || player?.__spikeColliderDisabled) return;
    const r = this.hitRadius + Number(player?.radius || 0.45) * 0.55;
    const dx = p.x - s.x, dy = p.y - s.y, dz = p.z - s.z;
    if (dx * dx + dy * dy + dz * dz <= r * r) this.hit(player);
  }

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

  hidePlayer(player, token) {
    if (player.__spikeDeathToken !== token) return;
    show(player.modelMesh, false); show(player.visualObject, false); show(player.guf, false); show(player.mesh, false);
  }
}
