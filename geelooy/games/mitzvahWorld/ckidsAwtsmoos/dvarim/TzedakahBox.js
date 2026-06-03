// B"H
/**
 * @file TzedakahBox.js
 * @description
 * Chapter 212: Every level receives its little sign.
 *
 * The Awtsmoos lets the pushkuh carry the icon of the current test: teeth,
 * flame, mirage, womb. The icon is spoken through UI text and echoed in the
 * visual box color, while the money law remains unchanged: collect all perutos,
 * give tzedakah, then the mezuzah opens and pays double.
 */
import Domem from "../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

const COLORS = Object.freeze({ waiting: 0xffffff, ready: 0x3cff86, given: 0xffd54a });
const clamp = n => Math.max(0, Math.min(255, Math.round(n)));
function levelCoinGoal(olam) { const fromWorld = Number(olam?.requiredPerutos); if (fromWorld > 0) return fromWorld; const coins = Array.isArray(olam?.nivrayim) ? olam.nivrayim.filter(n => n?.type === "coin") : []; return coins.reduce((s, c) => s + (Number(c?.value) || 0), 0) || 9; }
function texture(base = 0x2f79a8) { const size = 32, data = new Uint8Array(size * size * 4); for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) { const i = (y * size + x) * 4, seam = x % 8 === 0 || y % 8 === 0, grain = ((x * 19 + y * 37) % 25) - 10; data[i] = clamp(((base >> 16) & 255) + grain - (seam ? 35 : 0)); data[i + 1] = clamp(((base >> 8) & 255) + grain + (seam ? 6 : 0)); data[i + 2] = clamp((base & 255) + grain + (seam ? 12 : 0)); data[i + 3] = 255; } const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.needsUpdate = true; return t; }

export default class TzedakahBox extends Domem {
  type = "tzedakahBox";
  heesHawveh = true;
  static itemName = "Pushkuh";

  constructor(op = {}, olam) {
    super({ ...op, golem: null, isSolid: false, interactable: true }, olam);
    this.requiresAllCoins = op.requiresAllCoins !== false;
    this.requiredPerutos = Number(op.requiredPerutos || 0);
    this.donationAmount = Number(op.donationAmount || 0);
    this.levelIcon = op.levelIcon || "🪙";
    this.levelLabel = op.levelLabel || op.name || "Tzedakah";
    this._given = false; this._color = 0; this._lastSayAt = 0;
  }

  async heescheel(olam) {
    this.olam = olam;
    this.mesh = this.makeBox();
    this.mesh.position.copy(this.position.vector3());
    this.mesh.userData.skipRaycast = false; this.mesh.userData.addToOctree = false;
    await olam.hoyseef(this);
    this.isReady = true;
  }

  makeBox() {
    const root = new THREE.Group();
    root.name = `${this.name || "TzedakahBox"}_Root`;
    this.caseMaterial = new THREE.MeshLambertMaterial({ color: COLORS.waiting, map: texture() });
    this.slotMaterial = new THREE.MeshBasicMaterial({ color: 0x07121f });
    this.glowMaterial = new THREE.MeshBasicMaterial({ color: COLORS.given });
    this.iconMaterial = new THREE.MeshBasicMaterial({ color: 0xffd54a });
    this.part(root, "body", [0, 0, 0], [0.72, 0.82, 0.52], this.caseMaterial);
    this.part(root, "slot", [0, 0.44, -0.27], [0.44, 0.065, 0.032], this.slotMaterial);
    this.part(root, "coin", [0, 0.57, -0.3], [0.2, 0.2, 0.032], this.glowMaterial);
    this.part(root, "icon_top", [0, 0.82, 0], [0.3, 0.09, 0.3], this.iconMaterial);
    root.nivraAwtsmoos = this;
    root.traverse(c => { c.nivraAwtsmoos = this; c.userData.skipRaycast = false; c.userData.addToOctree = false; });
    return root;
  }

  part(root, name, pos, size, mat) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat); mesh.name = `${this.name || "TzedakahBox"}_${name}`; mesh.position.set(...pos); mesh.userData.addToOctree = false; root.add(mesh); }
  heesHawvoos() { const color = this._given ? COLORS.given : this.hasAllCoins() ? COLORS.ready : COLORS.waiting; if (this.caseMaterial && color !== this._color) { this._color = color; this.caseMaterial.color.setHex(color); } if (this.mesh) this.mesh.rotation.y = this._given ? Math.sin(Date.now() / 190) * 0.1 : 0; }
  requiredGoal() { return this.requiredPerutos > 0 ? this.requiredPerutos : levelCoinGoal(this.olam); }
  collectedCount() { return Number(this.olam?.__levelPerutosCollected || 0); }
  hasAllCoins() { return !this.requiresAllCoins || (this.requiredGoal() > 0 && this.collectedCount() >= this.requiredGoal()); }

  ayshPeula(peula, actor) {
    if (peula !== "accepted interaction") return super.ayshPeula?.(peula, actor);
    if (!this.hasAllCoins()) return this.say(`${this.levelIcon} ${this.levelLabel}: collect all perutos first (${this.collectedCount()}/${this.requiredGoal()})`, "#72fff4");
    if (this._given) return this.say(`${this.levelIcon} Tzedakah already given.`, "#ffd54a");
    this._given = true;
    const amount = this.donationAmount > 0 ? this.donationAmount : this.collectedCount();
    this.olam.__tzedakahBlessed = true; this.olam.__tzedakahDonation = amount;
    this.awakenAllMezuzahs();
    this.say(`${this.levelIcon} Tzedakah given: ${amount}. Reward later: ${amount * 2}.`, "#ffd54a");
    actor?.ayshPeula?.("tzedakah given", { source: this.name, amount, icon: this.levelIcon });
    return true;
  }

  awakenAllMezuzahs() { for (const mezuzah of this.olam?.__insideRightPostMezuzahs || []) mezuzah?.awakenColor?.(COLORS.given); }
  say(text, color) { const now = Date.now(); if (now - this._lastSayAt < 700 && this._lastText === text) return false; this._lastSayAt = now; this._lastText = text; this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text, color, replace: true, bilingual: true }); return false; }
}
