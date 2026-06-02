// B"H
/**
 * @file TzedakahBox.js
 * @description
 * Chapter 83: The Pushkuh Waited For Every Perutah.
 *
 * The Awtsmoos forbids the box from guessing that zero required means ready.
 * It derives a real goal from the level, coins, or JSON, gates blessing until
 * every copper perutah is gathered, and speaks one clear Hebrew/English line.
 */
import Domem from "../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

const clamp = n => Math.max(0, Math.min(255, Math.round(n)));
const COLORS = Object.freeze({ waiting: 0xffffff, ready: 0x3cff86, given: 0xffd54a });
const WAIT_TEXT = "אסוף את כל הפרוטות קודם — Collect all perutos first.";
const READY_TEXT = "צדקה ניתנה — Tzedakah given. The mezuzah is ready.";

function boxTexture(base = 0x2f79a8) {
  const size = 48;
  const data = new Uint8Array(size * size * 4);
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
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

function levelCoinGoal(olam) {
  const fromWorld = Number(olam?.requiredPerutos);
  if (Number.isFinite(fromWorld) && fromWorld > 0) return fromWorld;
  const coins = Array.isArray(olam?.nivrayim) ? olam.nivrayim.filter(n => n?.type === "coin") : [];
  const fromCoins = coins.reduce((sum, coin) => sum + (Number(coin?.value) || 0), 0);
  return fromCoins > 0 ? fromCoins : 9;
}

export default class TzedakahBox extends Domem {
  type = "tzedakahBox";
  heesHawveh = true;
  static itemName = "Pushkuh";

  constructor(op = {}, olam) {
    super({ ...op, golem: null, isSolid: false, interactable: true }, olam);
    this.requiresAllCoins = op.requiresAllCoins !== false;
    this.requiredPerutos = Number(op.requiredPerutos || 0);
    this._color = 0;
    this._given = false;
    this._lastSayAt = 0;
  }

  async heescheel(olam) {
    this.olam = olam;
    this.mesh = this.makeBox();
    this.mesh.position.copy(this.position.vector3());
    this.mesh.userData.skipRaycast = false;
    this.mesh.userData.addToOctree = false;
    await olam.hoyseef(this);
    this.isReady = true;
  }

  makeBox() {
    const root = new THREE.Group();
    root.name = `${this.name || "TzedakahBox"}_Root`;
    this.caseMaterial = new THREE.MeshLambertMaterial({ color: COLORS.waiting, map: boxTexture(0x2e7aac) });
    this.slotMaterial = new THREE.MeshBasicMaterial({ color: 0x07121f });
    this.glowMaterial = new THREE.MeshBasicMaterial({ color: COLORS.given });
    this.addPart(root, "body", [0, 0, 0], [0.72, 0.82, 0.52], this.caseMaterial);
    this.addPart(root, "slot", [0, 0.44, -0.27], [0.44, 0.065, 0.032], this.slotMaterial);
    this.addPart(root, "coin", [0, 0.57, -0.3], [0.2, 0.2, 0.032], this.glowMaterial);
    root.nivraAwtsmoos = this;
    root.traverse(child => { child.nivraAwtsmoos = this; child.userData.skipRaycast = false; });
    return root;
  }

  addPart(root, name, pos, size, mat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
    mesh.name = `${this.name || "TzedakahBox"}_${name}`;
    mesh.position.set(...pos);
    mesh.userData.addToOctree = false;
    root.add(mesh);
  }

  heesHawvoos() {
    const color = this._given ? COLORS.given : this.hasAllCoins() ? COLORS.ready : COLORS.waiting;
    if (this.caseMaterial && color !== this._color) {
      this._color = color;
      this.caseMaterial.color.setHex(color);
    }
    if (this.mesh) this.mesh.rotation.y = this._given ? Math.sin(Date.now() / 190) * 0.1 : 0;
  }

  requiredGoal() {
    return this.requiredPerutos > 0 ? this.requiredPerutos : levelCoinGoal(this.olam);
  }

  collectedCount() {
    return Number(this.olam?.__levelPerutosCollected || 0);
  }

  hasAllCoins() {
    if (!this.requiresAllCoins) return true;
    const required = this.requiredGoal();
    const collected = this.collectedCount();
    return required > 0 && collected >= required;
  }

  ayshPeula(peula, actor) {
    if (peula !== "accepted interaction") return super.ayshPeula?.(peula, actor);
    if (!this.hasAllCoins()) return this.say(`${WAIT_TEXT} (${this.collectedCount()}/${this.requiredGoal()})`, "#72fff4");
    if (this._given) return this.say(READY_TEXT, "#ffd54a");
    this._given = true;
    this.olam.__tzedakahBlessed = true;
    this.awakenAllMezuzahs();
    this.say(READY_TEXT, "#ffd54a");
    actor?.ayshPeula?.("tzedakah given", { source: this.name });
    return true;
  }

  awakenAllMezuzahs() {
    const mezuzahs = this.olam?.__insideRightPostMezuzahs || [];
    for (const mezuzah of mezuzahs) mezuzah?.awakenColor?.(COLORS.given);
  }

  say(text, color) {
    const now = Date.now();
    if (now - this._lastSayAt < 700 && this._lastText === text) return false;
    this._lastSayAt = now;
    this._lastText = text;
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text, color, replace: true, bilingual: true });
    return false;
  }
}
