// B"H
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

/**
 * @file SpikeField.js
 * @description Chapter 68: lava becomes revelation, not a freeze. The
 * Awtsmoos hides the chossid's visible garments, bursts Hebrew letters and
 * golden blocks into the scene for three seconds, clears the level's temporary
 * mitzvah state, and only then reloads the vessel.
 */
const PAD = 0.15;
const FEET_PAD = 0.2;
const RESET_DELAY_MS = 3000;
const LETTERS = Object.freeze(["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ", "ק", "ר", "ש", "ת"]);
const now = () => (globalThis.performance?.now?.() || Date.now()) / 1000;

/** @returns {THREE.DataTexture} Molten animated texture. */
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
  texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false; texture.flipY = false; texture.repeat.set(18, 8);
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
function freeze(player, token) {
  Object.assign(player, { __spikeDefeated: true, __spikeDeathControlsFrozen: true, __spikeColliderDisabled: true, __spikeDeathToken: token, moving: {} });
  player.velocity?.set?.(0, 0, 0);
  player.acceleration?.set?.(0, 0, 0);
}
function hideTree(root) {
  if (!root) return;
  root.visible = false;
  root.traverse?.(child => { child.visible = false; });
}

export default class SpikeField extends Domem {
  type = "spikeField";
  heesHawveh = true;

  /** @param {object} op Lava field data. @param {object} olam Runtime world. */
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.height = Number(op.height || 0.42);
    this.groundY = Number(op.groundY ?? -3);
    this.resetDelayMs = Number(op.resetDelayMs || RESET_DELAY_MS);
    this.box = paddedBox(op.bounds || boundsFromPoints(op.spikes || []), Number(op.pad ?? PAD));
    this._triggered = false;
    this._particles = [];
    this.texture = null;
  }

  /** @param {object} olam Runtime world. @returns {Promise<void>} */
  async heescheel(olam) {
    this.olam = olam;
    this.mesh = this.makeMesh();
    await olam.hoyseef(this);
    this.isReady = true;
  }

  /** @returns {THREE.Mesh} Lava mesh. */
  makeMesh() {
    this.texture = makeLavaTexture();
    const material = new THREE.MeshBasicMaterial({ map: this.texture, color: 0xff6a20 });
    const geometry = new THREE.BoxGeometry(this.box.width, this.height, this.box.depth, 1, 1, 1);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `${this.name || "LavaField"}_Hebrew_Letter_Reset_Field`;
    mesh.position.set(this.box.cx, this.groundY + this.height / 2, this.box.cz);
    mesh.userData.skipRaycast = true;
    mesh.userData.addToOctree = false;
    return mesh;
  }

  /** @returns {void} Moves texture, particles, and checks player feet. */
  heesHawvoos() {
    this.animateLavaTexture();
    this.animateParticles();
    if (this._triggered || this.olam?.__spikeDeathActive) return;
    const player = this.olam?.chossid, p = pos(player), fy = feetY(player);
    if (frozen(player) || !p || !Number.isFinite(fy)) return;
    if (this.containsXZ(p) && this.containsFeet(fy)) this.hit(player);
  }

  /** @returns {void} Scrolls lava texture. */
  animateLavaTexture() {
    if (!this.texture) return;
    const t = now();
    this.texture.offset.set((t * 0.025) % 1, (t * 0.012) % 1);
  }

  containsXZ(p) { return p.x >= this.box.minX && p.x <= this.box.maxX && p.z >= this.box.minZ && p.z <= this.box.maxZ; }
  containsFeet(y) { return y >= this.groundY - 0.35 && y <= this.groundY + this.height + FEET_PAD; }

  /** @param {object} player Player. @returns {void} */
  hit(player) {
    this._triggered = true;
    this.olam.__spikeDeathActive = true;
    const token = (this.olam.__spikeDeathToken || 0) + 1;
    this.olam.__spikeDeathToken = token;
    const origin = (pos(player) || this.mesh?.position || new THREE.Vector3()).clone();
    freeze(player, token);
    this.resetLevelStateNow();
    this.spawnLetterExplosion(origin);
    this.hidePlayer(player, token);
    this.overlay(origin, token);
    setTimeout(() => this.reloadFreshLevel(), this.resetDelayMs);
  }

  /** @returns {void} Clears runtime counters so all level coins and gates reset. */
  resetLevelStateNow() {
    this.olam.__levelPerutosCollected = 0;
    this.olam.__tzedakahBlessed = false;
    this.olam.__insideRightPostMezuzahs = [];
    this.olam?.ayshPeula?.("ui event", "perutahProgress", { collected: 0, requiredPerutos: this.olam.requiredPerutos || 0, reset: true });
  }

  /** @param {object} player Player. @param {number} token Death token. @returns {void} */
  hidePlayer(player, token) {
    if (player.__spikeDeathToken !== token) return;
    const roots = [player.modelMesh, player.visualObject, player.guf, player.mesh, player.emptyCopy, player.nonRotatingEmptyForMovement];
    roots.forEach(hideTree);
  }

  /** @param {THREE.Vector3} origin Origin. @param {number} token Token. @returns {void} */
  overlay(origin, token) {
    const payload = {
      effect: "spikeDeath",
      reason: "lava-floor",
      token,
      cssOnly: true,
      text: "לבה! אותיות ובלוקים מתפוצצים — חוזרים בעוד 3",
      worldPosition: { x: origin.x, y: origin.y, z: origin.z }
    };
    globalThis.postMessage?.({ type: "forceSpikeResetOverlay", payload });
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", payload);
  }

  /** @returns {void} Reloads the current level vessel. */
  reloadFreshLevel() { try { globalThis.location?.reload?.(); } catch {} }

  /** @param {THREE.Vector3} origin Origin. @returns {void} */
  spawnLetterExplosion(origin) {
    const scene = this.olam?.scene || this.mesh?.parent;
    if (!scene) return;
    for (let i = 0; i < 56; i += 1) scene.add(this.createParticle(origin, i));
  }

  /** @param {THREE.Vector3} origin Origin. @param {number} index Index. @returns {THREE.Mesh} */
  createParticle(origin, index) {
    const mesh = index % 3 ? this.makeLetterParticle(index) : this.makeBlockParticle(index);
    mesh.position.copy(origin);
    mesh.position.y += 1.2;
    mesh.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.52, 0.2 + Math.random() * 0.42, (Math.random() - 0.5) * 0.52);
    mesh.userData.birth = performance.now?.() || Date.now();
    mesh.userData.life = 2950;
    mesh.frustumCulled = false;
    this._particles.push(mesh);
    return mesh;
  }

  /** @param {number} index Index. @returns {THREE.Mesh} */
  makeLetterParticle(index) {
    const canvas = document.createElement("canvas");
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(255,80,10,0.12)"; ctx.fillRect(0, 0, 128, 128);
    ctx.font = "bold 86px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = index % 2 ? "#ffd54a" : "#ff6b2a";
    ctx.fillText(LETTERS[index % LETTERS.length], 64, 68);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide, depthWrite: false });
    return new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), material);
  }

  /** @param {number} index Index. @returns {THREE.Mesh} */
  makeBlockParticle(index) {
    const material = new THREE.MeshLambertMaterial({ color: index % 2 ? 0xff5122 : 0xffd54a, emissive: 0x661100 });
    return new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), material);
  }

  /** @returns {void} Animates reset explosion. */
  animateParticles() {
    const stamp = performance.now?.() || Date.now();
    this._particles = this._particles.filter(mesh => {
      const age = stamp - mesh.userData.birth;
      if (age > mesh.userData.life) { mesh.parent?.remove(mesh); return false; }
      mesh.position.add(mesh.userData.velocity);
      mesh.userData.velocity.y -= 0.006;
      mesh.rotation.x += 0.055; mesh.rotation.y += 0.045;
      mesh.scale.setScalar(Math.max(0.05, 1 - age / mesh.userData.life));
      return true;
    });
  }

  /** @returns {void} Allows external systems to rearm this field. */
  resetField() { this._triggered = false; }
}
