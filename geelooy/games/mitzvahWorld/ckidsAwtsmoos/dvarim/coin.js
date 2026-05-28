// B"H
/**
 * @file coin.js
 * @description
 * Chapter 11: The Perutah finally counts.
 *
 * A coin is a tiny copper moon. The Awtsmoos renews its edge, its glint, its
 * sound, and the number on the HUD. This file avoids worker-only storage traps:
 * the worker keeps a live in-memory level counter, then sends a clear UI event
 * to the main thread where the HUD can update safely.
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
  static description = "A small copper coin. Value: 1 Perutah.";
  static icon = CurrencySystem.getBase64Icon(1);
  static stackSize = 1024;

  value = 1;
  globalValue = 0;

  constructor(op = {}) {
    let isBeingCollected = false;
    const coinValue = safeNumber(op.value, 1) || 1;
    let color = "brown";
    if (coinValue >= CurrencySystem.VALUES.DINAR) color = "silver";
    if (coinValue >= CurrencySystem.VALUES.SELA) color = "gold";

    op.golem = {
      guf: { CylinderGeometry: [0.4, 0.4, 0.1, 12, 1] },
      toyr: { MeshLambertMaterial: { color, emissive: color, emissiveIntensity: 0.3 } }
    };

    super(op);
    this.value = coinValue;
    this.globalValue = safeNumber(op.globalValue, 0);
    this.proximity = safeNumber(op.proximity, 0.85);
    this.rotationSpeed = op.rotationSpeed || this.rotationSpeed;
    this.heesHawveh = true;

    this.on("heesHawvoos", me => {
      if (!me?.mesh) return;
      if (!isBeingCollected) {
        me.mesh.rotation.y += this.rotationSpeed;
        return;
      }
      me.mesh.scale.x -= 0.05;
      me.mesh.scale.y -= 0.05;
      me.mesh.scale.z -= 0.05;
      if (me.mesh.scale.x < 0) me.olam?.sealayk?.(me);
    });

    this.on("ready", () => {
      if (this.mesh) this.mesh.rotation.z = Math.PI / 2;
    });

    this.on("nivraNeechnas", nivra => {
      if (isBeingCollected || nivra?.type !== "chossid") return;
      isBeingCollected = true;
      this.collectFor(nivra);
    });

    this.placeholderName = "coin";
    this.on("collected", n => {
      n?.playSound?.("awtsmoos://dingSound", { layerName: "audio effects layer 1", loop: false });
    });
  }

  /** Collects the coin and tells inventory + HUD what changed. */
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

    olam?.ayshPeula?.("ui event", "perutahProgress", {
      levelKey: olam?.sourcePath || "ladder-1.js",
      requiredPerutos,
      collected,
      added: this.value,
      globalCoins,
      globalAdded: this.globalValue,
      funnyText: this.globalValue > 0 ? "Global sparkle swallowed!" : "Perutah ping!"
    });

    olam?.ayshPeula?.("ui event", "effectsOverlay", {
      effect: "transaction",
      text: this.globalValue > 0 ? "+GLOBAL SELA!" : "+1 Perutah",
      color: this.globalValue > 0 ? "#ffdf70" : "#fff176"
    });
  }

  /** Adds an inventory stack item if inventory exists. */
  addToInventory(nivra) {
    if (!nivra?.inventory?.addItem) return;
    nivra.inventory.addItem({
      id: "coin_" + this.value,
      className: "Coin",
      name: CurrencySystem.NAMES[this.value] || "Currency",
      value: this.value,
      description: `Value: ${this.value} Perutahs`,
      icon: CurrencySystem.getBase64Icon(this.value)
    });
  }

  /** Reads global coins only on main-thread-like contexts. */
  readGlobalCoinsSafely() {
    try {
      return safeNumber(globalThis.localStorage?.getItem("awtsmoosMitzvahGlobalCoins"), 0);
    } catch {
      return 0;
    }
  }

  /** Writes global coins only where storage exists. */
  writeGlobalCoinsSafely(globalCoins) {
    try {
      globalThis.localStorage?.setItem("awtsmoosMitzvahGlobalCoins", String(globalCoins));
    } catch {}
  }
}
