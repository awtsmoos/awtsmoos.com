// B"H
import Domem from "../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

/**
 * @file TzedakahBox.js
 * @description Chapter 61: a textured little charity chest, tight and clickable.
 * It glows green when all perutos are gathered, then gold after the giving is
 * checked. It never opens the door; it only blesses the mezuzah.
 */
const clamp = n => Math.max(0, Math.min(255, Math.round(n)));

/** @param {number} base Base RGB. @returns {THREE.DataTexture} */
function boxTexture(base = 0x2f79a8) {
  const size = 48, data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const i = (y * size + x) * 4;
    const seam = x % 12 === 0 || y % 12 === 0;
    const grain = ((x * 19 + y * 37) % 31) - 12;
    data[i] = clamp(((base >> 16) & 255) + grain - (seam ? 42 : 0));
    data[i + 1] = clamp(((base >> 8) & 255) + grain + (seam ? 8 : 0));
    data[i + 2] = clamp((base & 255) + grain + (seam ? 14 : 0));
    data[i + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.needsUpdate = true;
  return tex;
}

export default class TzedakahBox extends Domem {
  type = "tzedakahBox";
  heesHawveh = true;
  static itemName = "Tzedakah Box";

  /** @param {object} op JSON data. @param {object} olam Runtime world. */
  constructor(op = {}, olam) {
    super({ ...op, golem: null, isSolid: false, interactable: true }, olam);
    this.requiresAllCoins = op.requiresAllCoins !== false;
    this._color = 0;
    this._given = false;
  }

  /** @param {object} olam Runtime world. */
  async heescheel(olam) {
    this.olam = olam;
    this.mesh = this.makeBox();
    this.mesh.position.copy(this.position.vector3());
    this.mesh.userData.skipRaycast = false;
    this.mesh.userData.addToOctree = false;
    await olam.hoyseef(this);
    this.isReady = true;
  }

  /** @returns {THREE.Group} Clickable charity box. */
  makeBox() {
    const root = new THREE.Group();
    root.name = `${this.name || "TzedakahBox"}_Root`;
    this.caseMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, map: boxTexture(0x2e7aac) });
    this.slotMaterial = new THREE.MeshBasicMaterial({ color: 0x07121f });
    this.glowMaterial = new THREE.MeshBasicMaterial({ color: 0xffd54a });
    this.addPart(root, "body", [0, 0, 0], [0.72, 0.82, 0.52], this.caseMaterial);
    this.addPart(root, "slot", [0, 0.44, -0.27], [0.44, 0.065, 0.032], this.slotMaterial);
    this.addPart(root, "coin", [0, 0.57, -0.3], [0.2, 0.2, 0.032], this.glowMaterial);
    root.nivraAwtsmoos = this;
    root.traverse(child => { child.nivraAwtsmoos = this; });
    return root;
  }

  /** @param {THREE.Group} root Root. @param {string} name Name. @param {number[]} pos Pos. @param {number[]} size Size. @param {THREE.Material} mat Mat. */
  addPart(root, name, pos, size, mat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
    mesh.name = `${this.name || "TzedakahBox"}_${name}`;
    mesh.position.set(...pos);
    mesh.userData.skipRaycast = false;
    mesh.userData.addToOctree = false;
    root.add(mesh);
  }

  /** @returns {void} Color changes when coins are ready, final gold after checked. */
  heesHawvoos() {
    const color = this._given ? 0xffd54a : this.hasAllCoins() ? 0x3cff86 : 0xffffff;
    if (this.caseMaterial && color !== this._color) {
      this._color = color;
      this.caseMaterial.color.setHex(color);
    }
  }

  /** @returns {boolean} True when all level coins are collected. */
  hasAllCoins() {
    const required = Number(this.olam?.requiredPerutos || 0);
    const collected = Number(this.olam?.__levelPerutosCollected || 0);
    return !this.requiresAllCoins || collected >= required;
  }

  /** @param {string} peula Interaction. @param {object} actor Player. */
  ayshPeula(peula, actor) {
    if (peula !== "accepted interaction") return super.ayshPeula?.(peula, actor);
    if (!this.hasAllCoins()) return this.say("Bring every perutah first", "#72fff4");
    this._given = true;
    this.olam.__tzedakahBlessed = true;
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", {
      effect: "tzedakahBlessing",
      text: "Tzedakah given — the mezuzah is ready",
      color: "#ffd54a"
    });
    return true;
  }

  /** @param {string} text Message. @param {string} color Color. */
  say(text, color) {
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text, color });
    return false;
  }
}
