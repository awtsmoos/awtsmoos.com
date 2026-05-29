// B"H
import Domem from "../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

const READY_COLORS = Object.freeze({ waiting: 0x00ffe8, coins: 0x3cff86, blessed: 0xffd54a });

/**
 * @file SimpleDoor.js
 * @description Chapter 87: the mezuzah becomes impossible to miss. The
 * Awtsmoos hangs a bright case on the inside face of the right post, then adds
 * a floating Hebrew מ marker and a click aura that protrudes into the doorway.
 * This is not a hidden trigger anymore; it is the visible gate-seal itself.
 */
function makeMat(color, options = {}) { return new THREE.MeshBasicMaterial({ color, ...options }); }

function addBox(root, owner, name, pos, size, mat) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
  mesh.name = `${owner.name || "DoorMezuzah"}_${name}`;
  mesh.position.set(...pos);
  mesh.userData.addToOctree = false;
  mesh.userData.skipRaycast = false;
  mesh.nivraAwtsmoos = owner;
  root.add(mesh);
  return mesh;
}

function addLetterMem(root, owner, mat) {
  addBox(root, owner, "mem_left_leg", [-0.17, 0.06, -0.33], [0.07, 0.56, 0.07], mat);
  addBox(root, owner, "mem_right_leg", [0.17, 0.06, -0.33], [0.07, 0.56, 0.07], mat);
  addBox(root, owner, "mem_roof", [0, 0.32, -0.33], [0.42, 0.07, 0.07], mat);
  addBox(root, owner, "mem_floor", [0.03, -0.22, -0.33], [0.32, 0.07, 0.07], mat);
}

export default class SimpleDoor extends Domem {
  type = "interactiveDoor";
  heesHawveh = true;
  static itemName = "Clickable Mezuzah";

  constructor(op = {}, olam) {
    super({ ...op, golem: null, isSolid: false, interactable: true }, olam);
    this.next = String(op.next || op.target || op.destination || "").replace(/\.js$/i, ".json") || null;
    this.label = op.label || op.name || "Clickable Mezuzah";
    this.requiresAllCoins = op.requiresAllCoins !== false;
    this.requiresTzedakah = op.requiresTzedakah !== false;
    this._navigated = false;
    this._readyColor = 0;
  }

  async heescheel(olam) {
    this.olam = olam;
    this.mesh = this.buildMezuzahTrigger();
    this.mesh.position.copy(this.position.vector3());
    this.mesh.userData.skipRaycast = false;
    this.mesh.userData.addToOctree = false;
    await olam.hoyseef(this);
    this.isReady = true;
    this.registerMezuzahVessel();
    this.log("spawned", { worldPosition: { x: this.mesh.position.x, y: this.mesh.position.y, z: this.mesh.position.z }, children: this.mesh.children.length, next: this.next, interactable: this.interactable });
  }

  buildMezuzahTrigger() {
    const root = new THREE.Group();
    root.name = `${this.name || "Door"}_VISIBLE_CLICKABLE_MEZUZAH`;
    root.nivraAwtsmoos = this;
    this.caseMaterial = makeMat(READY_COLORS.waiting);
    this.scrollMaterial = makeMat(0x102d2c);
    this.glowMaterial = makeMat(READY_COLORS.waiting, { transparent: true, opacity: 0.48, depthWrite: false });
    this.memMaterial = makeMat(0xffffff);
    addBox(root, this, "bright_outer_case", [0, 0, -0.18], [0.46, 1.85, 0.24], this.caseMaterial);
    addBox(root, this, "dark_scroll_line", [0, 0, -0.33], [0.16, 1.18, 0.07], this.scrollMaterial);
    addBox(root, this, "big_click_aura", [0, 0, -0.42], [0.94, 2.35, 0.12], this.glowMaterial);
    addLetterMem(root, this, this.memMaterial);
    root.rotation.z = -0.18;
    root.traverse(child => { child.nivraAwtsmoos = this; child.userData.skipRaycast = false; child.userData.addToOctree = false; child.frustumCulled = false; });
    return root;
  }

  registerMezuzahVessel() {
    const list = this.olam.__insideRightPostMezuzahs || [];
    if (!list.includes(this)) list.push(this);
    this.olam.__insideRightPostMezuzahs = list;
    this.log("registered", { count: list.length });
  }

  heesHawvoos() {
    const color = this.canOpen() ? READY_COLORS.blessed : this.hasAllCoins() ? READY_COLORS.coins : READY_COLORS.waiting;
    if (this.caseMaterial && color !== this._readyColor) this.awakenColor(color);
    if (this.mesh) {
      this.mesh.rotation.z = -0.18 + (this.canOpen() ? Math.sin(Date.now() / 180) * 0.04 : 0);
      this.mesh.visible = true;
      this.mesh.traverse?.(child => { child.visible = true; });
    }
  }

  awakenColor(color) {
    this._readyColor = color;
    this.caseMaterial?.color?.setHex(color);
    this.glowMaterial?.color?.setHex(color);
    this.log("color", { color, canOpen: this.canOpen(), coins: this.hasAllCoins(), tzedakah: this.hasTzedakahBlessing() });
  }

  hasAllCoins() {
    const required = Number(this.olam?.requiredPerutos || 0);
    const collected = Number(this.olam?.__levelPerutosCollected || 0);
    return !this.requiresAllCoins || collected >= required;
  }

  hasTzedakahBlessing() { return !this.requiresTzedakah || this.olam?.__tzedakahBlessed === true; }
  canOpen() { return this.hasAllCoins() && this.hasTzedakahBlessing(); }

  ayshPeula(peula, actor) {
    if (peula !== "accepted interaction") return super.ayshPeula?.(peula, actor);
    this.log("clicked", { coins: this.hasAllCoins(), tzedakah: this.hasTzedakahBlessing(), next: this.next });
    if (!this.hasAllCoins()) return this.say("אסוף את כל הפרוטות תחילה", "#72fff4");
    if (!this.hasTzedakahBlessing()) return this.say("שים צדקה בפושקע ואז המזוזה תזהיב", "#3cff86");
    this.openNextLevel(actor);
    return true;
  }

  say(text, color) {
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text, color });
    this.olam?.ayshPeula?.("ui event", "toast", { message: text, type: "info" });
    return false;
  }

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

  log(stage, data = {}) { console.info("B\"H | MEZUZAH_TRACE", { stage, name: this.name, ...data }); }
}
