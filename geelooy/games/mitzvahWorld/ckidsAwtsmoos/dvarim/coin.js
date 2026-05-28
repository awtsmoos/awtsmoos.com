// B"H
/**
 * @file coin.js
 * @description Chapter 13: Gold coins count and keep their gold material.
 */
import Tzomayach from "../chayim/tzomayach.js";
import { CurrencySystem } from "./currencySystem.js";

export { CurrencySystem };

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default class Coin extends Tzomayach {
  rotationSpeed = 0.01;
  type = "coin";
  static itemName = "Perutah";
  static description = "A small gold perutah for the clean ladder.";
  static icon = CurrencySystem.getBase64Icon(1);
  static stackSize = 1024;
  value = 1;
  globalValue = 0;

  constructor(op = {}) {
    let isBeingCollected = false;
    const coinValue = safeNumber(op.value, 1) || 1;
    op.golem ||= {
      guf: { CylinderGeometry: [0.45, 0.45, 0.12, 24, 1] },
      toyr: { MeshStandardMaterial: { color: 0xffd54a, emissive: 0xaa7700, metalness: 0.9, roughness: 0.2 } }
    };

    super(op);
    this.value = coinValue;
    this.globalValue = safeNumber(op.globalValue, 0);
    this.proximity = safeNumber(op.proximity, 0.95);
    this.rotationSpeed = op.rotationSpeed || this.rotationSpeed;
    this.heesHawveh = true;

    this.on("heesHawvoos", me => {
      if (!me?.mesh) return;
      if (!isBeingCollected) {
        me.mesh.rotation.y += this.rotationSpeed;
        return;
      }
      me.mesh.scale.multiplyScalar(0.86);
      if (me.mesh.scale.x < 0.04) me.olam?.sealayk?.(me);
    });

    this.on("ready", () => {
      if (this.mesh) {
        this.mesh.rotation.z = Math.PI / 2;
        this.mesh.userData.skipRaycast = true;
      }
    });

    this.on("nivraNeechnas", nivra => {
      if (isBeingCollected || nivra?.type !== "chossid") return;
      isBeingCollected = true;
      this.collectFor(nivra);
    });

    this.placeholderName = "coin";
    this.on("collected", n => n?.playSound?.("awtsmoos://dingSound", { layerName: "audio effects layer 1", loop: false }));
  }

  collectFor(nivra) {
    this.ayshPeula("collected", this, nivra);
    this.addToInventory(nivra);
    const olam = this.olam;
    const requiredPerutos = safeNumber(olam?.requiredPerutos, 7) || 7;
    olam.__levelPerutosCollected = safeNumber(olam?.__levelPerutosCollected, 0) + this.value;
    olam.__globalPerutosCollected = safeNumber(olam?.__globalPerutosCollected, 0) + this.globalValue;
    const collected = olam.__levelPerutosCollected;
    const globalCoins = this.readGlobalCoinsSafely() + this.globalValue;
    this.writeGlobalCoinsSafely(globalCoins);

    const payload = {
      levelKey: olam?.sourcePath || "ladder-1.js",
      requiredPerutos,
      collected,
      added: this.value,
      globalCoins,
      globalAdded: this.globalValue,
      funnyText: this.globalValue > 0 ? "Global sparkle swallowed!" : "Perutah ping!"
    };
    olam?.ayshPeula?.("ui event", "perutahProgress", payload);
    olam?.ayshPeula?.("ui event", "gameHUD", { perutahProgress: payload });
    olam?.ayshPeula?.("ui event", "effectsOverlay", { effect: "transaction", text: this.globalValue > 0 ? "+GLOBAL SELA!" : "+1 Perutah", color: "#fff176" });
  }

  addToInventory(nivra) {
    if (!nivra?.inventory?.addItem) return;
    nivra.inventory.addItem({ id: "coin_" + this.value, className: "Coin", name: CurrencySystem.NAMES[this.value] || "Currency", value: this.value, description: `Value: ${this.value} Perutahs`, icon: CurrencySystem.getBase64Icon(this.value) });
  }

  readGlobalCoinsSafely() {
    try { return safeNumber(globalThis.localStorage?.getItem("awtsmoosMitzvahGlobalCoins"), 0); }
    catch { return 0; }
  }

  writeGlobalCoinsSafely(globalCoins) {
    try { globalThis.localStorage?.setItem("awtsmoosMitzvahGlobalCoins", String(globalCoins)); }
    catch {}
  }
}
