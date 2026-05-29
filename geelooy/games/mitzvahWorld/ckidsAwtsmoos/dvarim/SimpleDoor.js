// B"H
import Domem from "../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

/**
 * @file SimpleDoor.js
 * @description Chapter 64: the right doorpost becomes a living mezuzah. The
 * Awtsmoos, without body or form, breathes through the tiny case: turquoise
 * while waiting, green when every perutah is gathered, gold only after tzedakah
 * enters the pushkuh. Then one click tears open the next level cleanly.
 */
const READY_COLORS = Object.freeze({ waiting: 0x72fff4, coins: 0x3cff86, blessed: 0xffd54a });

export default class SimpleDoor extends Domem {
  type = "interactiveDoor";
  heesHawveh = true;
  static itemName = "Inside Right Doorpost Mezuzah";

  /** @param {object} op Door data. @param {object} olam Runtime world. */
  constructor(op = {}, olam) {
    super({ ...op, golem: null, isSolid: false, interactable: true }, olam);
    this.next = String(op.next || op.target || op.destination || "").replace(/\.js$/i, ".json") || null;
    this.label = op.label || op.name || "Inside Right Doorpost Mezuzah";
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
    this.registerMezuzahVessel();
  }

  /** @returns {THREE.Group} Clickable mezuzah group on the inside right post. */
  buildMezuzahTrigger() {
    const root = new THREE.Group();
    root.name = `${this.name || "Door"}_Inside_Right_Post_Mezuzah`;
    this.caseMaterial = new THREE.MeshBasicMaterial({ color: READY_COLORS.waiting });
    this.scrollMaterial = new THREE.MeshBasicMaterial({ color: 0x102d2c });
    this.glowMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 });
    this.addBox(root, "outer_case", [0, 0, 0], [0.28, 1.42, 0.2], this.caseMaterial);
    this.addBox(root, "inner_scroll", [0, 0, -0.105], [0.13, 0.9, 0.05], this.scrollMaterial);
    this.addBox(root, "ready_aura", [0, 0, -0.13], [0.36, 1.58, 0.035], this.glowMaterial);
    root.nivraAwtsmoos = this;
    root.traverse(child => { child.nivraAwtsmoos = this; child.userData.skipRaycast = false; });
    return root;
  }

  /** @param {THREE.Group} root Root. @param {string} name Part. @param {number[]} p Pos. @param {number[]} s Size. @param {THREE.Material} mat Mat. */
  addBox(root, name, p, s, mat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...s), mat);
    mesh.name = `${this.name || "Door"}_${name}`;
    mesh.position.set(...p);
    mesh.userData.addToOctree = false;
    root.add(mesh);
  }

  /** @returns {void} Gives pushkuh code a direct list of mezuzahs to awaken. */
  registerMezuzahVessel() {
    const list = this.olam.__insideRightPostMezuzahs || [];
    if (!list.includes(this)) list.push(this);
    this.olam.__insideRightPostMezuzahs = list;
  }

  /** @returns {void} Updates readiness color only; never auto-opens. */
  heesHawvoos() {
    const color = this.canOpen() ? READY_COLORS.blessed : this.hasAllCoins() ? READY_COLORS.coins : READY_COLORS.waiting;
    if (this.caseMaterial && color !== this._readyColor) this.awakenColor(color);
    if (this.mesh) this.mesh.rotation.z = this.canOpen() ? Math.sin(Date.now() / 180) * 0.04 : 0;
  }

  /** @param {number} color Hex color. @returns {void} */
  awakenColor(color) {
    this._readyColor = color;
    this.caseMaterial.color.setHex(color);
    if (this.glowMaterial) this.glowMaterial.color.setHex(color);
  }

  /** @returns {boolean} True when the level coin count is complete. */
  hasAllCoins() {
    const required = Number(this.olam?.requiredPerutos || 0);
    const collected = Number(this.olam?.__levelPerutosCollected || 0);
    return !this.requiresAllCoins || collected >= required;
  }

  /** @returns {boolean} True after tzedakah box was clicked with all coins. */
  hasTzedakahBlessing() { return !this.requiresTzedakah || this.olam?.__tzedakahBlessed === true; }

  /** @returns {boolean} True when the mezuzah can open. */
  canOpen() { return this.hasAllCoins() && this.hasTzedakahBlessing(); }

  /** @param {string} peula Interaction name. @param {object} actor Interactor. */
  ayshPeula(peula, actor) {
    if (peula !== "accepted interaction") return super.ayshPeula?.(peula, actor);
    if (!this.hasAllCoins()) return this.say("אסוף את כל הפרוטות תחילה", "#72fff4");
    if (!this.hasTzedakahBlessing()) return this.say("שים צדקה בפושקע ואז המזוזה תזהיב", "#3cff86");
    this.openNextLevel(actor);
    return true;
  }

  /** @param {string} text Text. @param {string} color CSS color. */
  say(text, color) {
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text, color });
    this.olam?.ayshPeula?.("ui event", "toast", { message: text, type: "info" });
    return false;
  }

  /** @param {object} actor Player. @returns {void} Navigates once with fallbacks. */
  openNextLevel(actor) {
    if (!this.next || this._navigated) return;
    this._navigated = true;
    const payload = { next: this.next, levelId: this.next, id: this.next, label: this.label, source: "inside-right-post-mezuzah" };
    this.say("המזוזה נפתחה — עולים שלב!", "#ffd54a");
    this.olam?.ayshPeula?.("ui event", "navigateLevel", payload);
    this.olam?.ayshPeula?.("navigateLevel", payload);
    this.olam?.ayshPeula?.("load level", this.next);
    globalThis.dispatchEvent?.(new CustomEvent("awtsmoos:navigateLevel", { detail: payload }));
    actor?.ayshPeula?.("entered next level", payload);
  }
}
