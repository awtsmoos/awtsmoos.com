// B"H
/**
 * @file SpikeField.js
 * @description
 * Chapter 79: Lava Reset Counted First, Coins Returned Later.
 *
 * The Awtsmoos splits the death breath from the rebirth breath. Lava impact
 * resets the counter immediately, but coins do not visually return until the
 * worker has moved the player back to the start platform.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { SpikeParticleFactory, animateSpikeParticles } from "./spikeField/SpikeParticles.js";

const PAD = 0.15;
const FEET_PAD = 0.2;
const RESET_DELAY_MS = 3000;
const EXPLOSION_DELAY_MS = 240;
const now = () => (globalThis.performance?.now?.() || Date.now()) / 1000;

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
  return points.reduce((box, point) => ({ minX: Math.min(box.minX, Number(point.x) || 0), maxX: Math.max(box.maxX, Number(point.x) || 0), minZ: Math.min(box.minZ, Number(point.z) || 0), maxZ: Math.max(box.maxZ, Number(point.z) || 0) }), { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity });
}

export function paddedBox(box, pad = PAD) {
  const minX = box.minX - pad, maxX = box.maxX + pad, minZ = box.minZ - pad, maxZ = box.maxZ + pad;
  return { minX, maxX, minZ, maxZ, cx: (minX + maxX) / 2, cz: (minZ + maxZ) / 2, width: maxX - minX, depth: maxZ - minZ };
}

function playerPosition(player) { return player?.mesh?.position || player?.modelMesh?.position || null; }
function playerFeetY(player) {
  if (player?.collider?.start) return player.collider.start.y - (Number(player.radius) || 0.45);
  const position = playerPosition(player);
  return Number.isFinite(position?.y) ? position.y - (Number(player?.radius) || 0.45) : NaN;
}
function isFrozen(player) { return !player || player.__spikeDefeated || player.__spikeDeathControlsFrozen || player.__spikeColliderDisabled; }
function freezePlayer(player, token) {
  Object.assign(player, { __spikeDefeated: true, __spikeDeathControlsFrozen: true, __spikeColliderDisabled: true, __spikeDeathToken: token, moving: {} });
  player.velocity?.set?.(0, 0, 0);
  player.acceleration?.set?.(0, 0, 0);
}
function hideTree(root) { if (!root) return; root.visible = false; root.traverse?.(child => { child.visible = false; }); }

export default class SpikeField extends Domem {
  type = "spikeField";
  heesHawveh = true;

  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.height = Number(op.height || 0.42);
    this.groundY = Number(op.groundY ?? -3);
    this.resetDelayMs = Number(op.resetDelayMs || RESET_DELAY_MS);
    this.box = paddedBox(op.bounds || boundsFromPoints(op.spikes || []), Number(op.pad ?? PAD));
    this._triggered = false;
    this._particles = [];
    this.particleFactory = new SpikeParticleFactory(olam);
    this.texture = null;
  }

  async heescheel(olam) {
    this.olam = olam;
    this.particleFactory.olam = olam;
    this.mesh = this.makeMesh();
    await olam.hoyseef(this);
    this.isReady = true;
  }

  makeMesh() {
    this.texture = makeLavaTexture();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(this.box.width, this.height, this.box.depth, 1, 1, 1), new THREE.MeshBasicMaterial({ map: this.texture, color: 0xff6a20 }));
    mesh.name = `${this.name || "LavaField"}_Delayed_Final_Position_Field`;
    mesh.position.set(this.box.cx, this.groundY + this.height / 2, this.box.cz);
    mesh.userData.skipRaycast = true;
    mesh.userData.addToOctree = false;
    return mesh;
  }

  heesHawvoos() {
    this.animateLavaTexture();
    this._particles = animateSpikeParticles(this._particles);
    if (this._triggered || this.olam?.__spikeDeathActive) return;
    const player = this.olam?.chossid;
    const position = playerPosition(player);
    const feet = playerFeetY(player);
    if (isFrozen(player) || !position || !Number.isFinite(feet)) return;
    if (this.containsXZ(position) && this.containsFeet(feet)) this.hit(player);
  }

  animateLavaTexture() {
    if (!this.texture) return;
    const t = now();
    this.texture.offset.set((t * 0.025) % 1, (t * 0.012) % 1);
  }
  containsXZ(position) { return position.x >= this.box.minX && position.x <= this.box.maxX && position.z >= this.box.minZ && position.z <= this.box.maxZ; }
  containsFeet(y) { return y >= this.groundY - 0.35 && y <= this.groundY + this.height + FEET_PAD; }

  hit(player) {
    this._triggered = true;
    this.olam.__spikeDeathActive = true;
    this.olam.__perutahResetLock = true;
    const token = (this.olam.__spikeDeathToken || 0) + 1;
    this.olam.__spikeDeathToken = token;
    const origin = this.finalExplosionOrigin(player);
    console.info("B\"H | SPIKE_FIELD_TRACE", { stage: "hit", origin, token });
    freezePlayer(player, token);
    this.resetLevelStateNow();
    setTimeout(() => this.spawnLetterExplosion(origin), EXPLOSION_DELAY_MS);
    setTimeout(() => this.hidePlayer(player, token), EXPLOSION_DELAY_MS + 380);
    this.overlay(origin, token);
  }

  finalExplosionOrigin(player) {
    const pos = (playerPosition(player) || this.mesh?.position || new THREE.Vector3()).clone();
    pos.y = this.groundY + this.height + 0.55;
    return pos;
  }

  resetLevelStateNow() {
    this.olam.__levelPerutosCollected = 0;
    this.olam.__tzedakahBlessed = false;
    this.olam.__tzedakahDonation = 0;
    this.olam.__personalRewardPaid = false;
    const mezuzahs = this.olam.__insideRightPostMezuzahs || [];
    for (const mezuzah of mezuzahs) mezuzah?.awakenColor?.(0x72fff4);
    const lossPayload = { collected: 0, requiredPerutos: this.olam.requiredPerutos || 0, reset: true, personalDelta: -1, reason: "lava fall" };
    this.olam?.ayshPeula?.("ui event", "perutahProgress", lossPayload);
    this.olam?.ayshPeula?.("ui event", "gameHUD", { perutahProgress: lossPayload, personalPerutas: lossPayload });
  }

  hidePlayer(player, token) {
    if (player.__spikeDeathToken !== token) return;
    [player.modelMesh, player.visualObject, player.guf, player.mesh, player.emptyCopy, player.nonRotatingEmptyForMovement].forEach(hideTree);
  }

  overlay(origin, token) {
    const payload = { effect: "spikeDeath", reason: "lava-floor", token, cssOnly: true, overlayDelayMs: this.resetDelayMs, text: "לבה! אותיות ובלוקים מתפוצצים — חוזרים בעוד 3", worldPosition: { x: origin.x, y: origin.y, z: origin.z } };
    globalThis.postMessage?.({ type: "forceSpikeResetOverlay", payload });
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", payload);
  }

  spawnLetterExplosion(origin) {
    const scene = this.olam?.scene || this.mesh?.parent;
    if (!scene) return;
    const particles = this.particleFactory.createMany(origin, 48);
    particles.forEach(particle => scene.add(particle));
    this._particles.push(...particles);
    console.info("B\"H | SPIKE_FIELD_TRACE", { stage: "explosion", origin, count: particles.length });
  }

  resetField() { this._triggered = false; }
}
