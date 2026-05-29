// B"H
import Domem from "../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

/**
 * @file SimpleDoor.js
 * @description Chapter 60: the mezuzah refuses premature gold. Coins prepare
 * the tzedakah box; checked tzedakah awakens the mezuzah; clicked mezuzah opens
 * the next JSON vessel.
 */
export default class SimpleDoor extends Domem {
  type = "interactiveDoor";
  heesHawveh = true;
  static itemName = "Door";

  /** @param {object} op Door data. @param {object} olam Runtime world. */
  constructor(op = {}, olam) {
    super({ ...op, golem: null, isSolid: false, interactable: true }, olam);
    this.next = String(op.next || op.target || op.destination || "").replace(/\.js$/i, ".json") || null;
    this.label = op.label || op.name || "Mezuzah";
    this.requiresAllCoins = op.requiresAllCoins !== false;
    this.requiresTzedakah = op.requiresTzedakah !== false;
    this._navigated = false;
    this._readyColor = 0;
  }

  /** @param {object} olam Runtime world. @returns {Promise<void>} */
  async heescheel(olam) {
    this.olam = olam;
    this.mesh = this.buildMezuzahTrigger();
    this.mesh.position.copy(this.position.vector3());
    this.mesh.userData.skipRaycast = false;
    this.mesh.userData.addToOctree = false;
    await olam.hoyseef(this);
    this.isReady = true;
  }

  /** @returns {THREE.Group} Clickable mezuzah group. */
  buildMezuzahTrigger() {
    const root = new THREE.Group();
    root.name = `${this.name || "Door"}_Manual_Mezuzah`;
    this.caseMaterial = new THREE.MeshBasicMaterial({ color: 0x72fff4 });
    this.scrollMaterial = new THREE.MeshBasicMaterial({ color: 0x102d2c });
    this.addBox(root, "case", [0, 0, 0], [0.26, 1.35, 0.18], this.caseMaterial);
    this.addBox(root, "scroll", [0, 0, -0.095], [0.12, 0.88, 0.045], this.scrollMaterial);
    root.nivraAwtsmoos = this;
    root.traverse(child => { child.nivraAwtsmoos = this; });
    return root;
  }

  /** @param {THREE.Group} root Root. @param {string} name Part. @param {number[]} p Pos. @param {number[]} s Size. @param {THREE.Material} mat Mat. */
  addBox(root, name, p, s, mat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...s), mat);
    mesh.name = `${this.name || "Door"}_${name}`;
    mesh.position.set(...p);
    mesh.userData.skipRaycast = false;
    mesh.userData.addToOctree = false;
    root.add(mesh);
  }

  /** @returns {void} Updates readiness color only; never auto-opens. */
  heesHawvoos() {
    const color = this.canOpen() ? 0xffd54a : this.hasAllCoins() ? 0x3cff86 : 0x72fff4;
    if (color === this._readyColor || !this.caseMaterial) return;
    this._readyColor = color;
    this.caseMaterial.color.setHex(color);
  }

  /** @returns {boolean} True when the level coin count is complete. */
  hasAllCoins() {
    const required = Number(this.olam?.requiredPerutos || 0);
    const collected = Number(this.olam?.__levelPerutosCollected || 0);
    return !this.requiresAllCoins || collected >= required;
  }

  /** @returns {boolean} True after tzedakah box was checked. */
  hasTzedakahBlessing() {
    return !this.requiresTzedakah || this.olam?.__tzedakahBlessed === true;
  }

  /** @returns {boolean} True when the mezuzah can open. */
  canOpen() { return this.hasAllCoins() && this.hasTzedakahBlessing(); }

  /** @param {string} peula Interaction name. @param {object} actor Interactor. */
  ayshPeula(peula, actor) {
    if (peula !== "accepted interaction") return super.ayshPeula?.(peula, actor);
    if (!this.hasAllCoins()) return this.say("Collect every coin first", "#72fff4");
    if (!this.hasTzedakahBlessing()) return this.say("Check the tzedakah box first", "#3cff86");
    this.openNextLevel();
    return true;
  }

  /** @param {string} text Text. @param {string} color CSS color. */
  say(text, color) {
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text, color });
    return false;
  }

  /** @returns {void} Navigates once. */
  openNextLevel() {
    if (!this.next || this._navigated) return;
    this._navigated = true;
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: "Mezuzah opened", color: "#ffd54a" });
    this.olam?.ayshPeula?.("ui event", "navigateLevel", { next: this.next, label: this.label, source: "manual-mezuzah" });
  }
}
