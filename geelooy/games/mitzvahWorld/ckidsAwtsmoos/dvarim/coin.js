// B"H
/**
 * @file coin.js
 * @description Chapter 61: perutos belong to the HUD counter, not the equipment
 * inventory. The Awtsmoos keeps the backpack clean while the mitzvah count rises.
 */
import Tzomayach from "../chayim/tzomayach.js";
import { CurrencySystem } from "./currencySystem.js";

export { CurrencySystem };
const safeNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export default class Coin extends Tzomayach {
  rotationSpeed = 0.01;
  type = "coin";
  static itemName = "Perutah";
  static description = "A gold perutah for the ladder counter.";
  static icon = CurrencySystem.getBase64Icon(1);
  static stackSize = 1024;
  value = 1;
  globalValue = 0;

  /** @param {object} op Coin config from JSON. */
  constructor(op = {}) {
    let collecting = false;
    op.golem ||= {
      guf: { CylinderGeometry: [0.42, 0.42, 0.1, 24, 1] },
      toyr: { MeshStandardMaterial: { color: 0xffd54a, emissive: 0xaa7700, metalness: 0.9, roughness: 0.2 } }
    };
    super(op);
    this.value = safeNumber(op.value, 1) || 1;
    this.globalValue = safeNumber(op.globalValue, 0);
    this.proximity = safeNumber(op.proximity, 0.78);
    this.rotationSpeed = op.rotationSpeed || this.rotationSpeed;
    this.heesHawveh = true;
    this.bindCoinLife(() => collecting, value => { collecting = value; });
  }

  /** @param {Function} isCollecting Getter. @param {Function} setCollecting Setter. */
  bindCoinLife(isCollecting, setCollecting) {
    this.on("ready", () => {
      if (!this.mesh) return;
      this.mesh.rotation.z = Math.PI / 2;
      this.mesh.userData.skipRaycast = true;
      this.mesh.userData.addToOctree = false;
    });
    this.on("heesHawvoos", me => {
      if (!me?.mesh) return;
      if (!isCollecting()) { me.mesh.rotation.y += this.rotationSpeed; return; }
      me.mesh.scale.multiplyScalar(0.84);
      if (me.mesh.scale.x < 0.04) me.olam?.sealayk?.(me);
    });
    this.on("nivraNeechnas", nivra => {
      if (isCollecting() || nivra?.type !== "chossid") return;
      setCollecting(true);
      this.collectFor(nivra);
    });
    this.on("collected", n => n?.playSound?.("awtsmoos://dingSound", { layerName: "audio effects layer 1", loop: false }));
  }

  /** @param {object} nivra Collecting player. */
  collectFor(nivra) {
    this.ayshPeula("collected", this, nivra);
    const olam = this.olam;
    const requiredPerutos = safeNumber(olam?.requiredPerutos, 7) || 7;
    olam.__levelPerutosCollected = safeNumber(olam?.__levelPerutosCollected, 0) + this.value;
    olam.__globalPerutosCollected = safeNumber(olam?.__globalPerutosCollected, 0) + this.globalValue;
    const globalCoins = this.readGlobalCoinsSafely() + this.globalValue;
    this.writeGlobalCoinsSafely(globalCoins);
    const payload = { levelKey: olam?.sourcePath || "ladder-1.json", requiredPerutos, collected: olam.__levelPerutosCollected, added: this.value, globalCoins, globalAdded: this.globalValue };
    olam?.ayshPeula?.("ui event", "perutahProgress", payload);
    olam?.ayshPeula?.("ui event", "gameHUD", { perutahProgress: payload });
    olam?.ayshPeula?.("ui event", "effectsOverlay", { effect: "transaction", text: "+1 Perutah", color: "#fff176" });
  }

  /** @returns {number} Global perutos. */
  readGlobalCoinsSafely() {
    try { return safeNumber(globalThis.localStorage?.getItem("awtsmoosMitzvahGlobalCoins"), 0); } catch { return 0; }
  }

  /** @param {number} globalCoins New total. */
  writeGlobalCoinsSafely(globalCoins) {
    try { globalThis.localStorage?.setItem("awtsmoosMitzvahGlobalCoins", String(globalCoins)); } catch {}
  }
}
