// B"H
/**
 * @file coin.js
 * @description
 * Chapter 151: Perutah collection becomes exact again.
 *
 * The lava levels were using a broad sphere that could grab coins too early.
 * Now a perutah requires a real capsule-to-coin touch with a smaller radius and
 * a vertical overlap gate. Future AI: do not inflate `proximity` to make coins
 * feel easier; tune coin placement instead.
 */
import Tzomayach from "../chayim/tzomayach.js";
import Utils from "../utils.js";
import { CurrencySystem } from "./currencySystem.js";

export { CurrencySystem };
const safeNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const COPPER = Object.freeze({ color: 0xd98a45, emissive: 0x5a240b, roughness: 0.22, metalness: 0.88 });

function markCoinVisual(mesh) {
  if (!mesh) return;
  mesh.userData ||= {};
  Object.assign(mesh.userData, { skipRaycast: true, skipOctree: true, noOctree: true, addToOctree: false, isCoinVisual: true });
  mesh.traverse?.(child => { child.userData ||= {}; Object.assign(child.userData, mesh.userData); });
}

function copperGolem() {
  return { guf: { CylinderGeometry: [0.58, 0.58, 0.13, 40, 1] }, toyr: { MeshStandardMaterial: { color: COPPER.color, emissive: COPPER.emissive, metalness: COPPER.metalness, roughness: COPPER.roughness } } };
}

function applyCopperMaterial(root) {
  root?.traverse?.(child => {
    const materials = Array.isArray(child?.material) ? child.material : child?.material ? [child.material] : [];
    materials.forEach(material => {
      material.color?.setHex?.(COPPER.color);
      material.emissive?.setHex?.(COPPER.emissive);
      if ("metalness" in material) material.metalness = COPPER.metalness;
      if ("roughness" in material) material.roughness = COPPER.roughness;
      material.needsUpdate = true;
    });
  });
}

function setTreeVisible(root, visible) {
  if (!root) return;
  root.visible = visible;
  root.traverse?.(child => { child.visible = visible; });
}

function capsuleYRange(capsule) {
  const a = capsule?.start?.y ?? capsule?.center?.y ?? 0;
  const b = capsule?.end?.y ?? a;
  const r = safeNumber(capsule?.radius, 0);
  return { min: Math.min(a, b) - r, max: Math.max(a, b) + r };
}

export default class Coin extends Tzomayach {
  rotationSpeed = 0.018;
  type = "coin";
  static itemName = "Perutah";
  static description = "A bright copper perutah for the ladder counter.";
  static icon = CurrencySystem.getBase64Icon(1);
  static stackSize = 1024;
  value = 1;
  globalValue = 0;
  __collected = false;
  __collecting = false;
  __needsFreshEntry = false;

  constructor(op = {}) {
    op.golem ||= copperGolem();
    super(op);
    this.value = safeNumber(op.value, 1) || 1;
    this.globalValue = safeNumber(op.globalValue, 0);
    this.proximity = safeNumber(op.proximity, 0.72);
    this.verticalGrace = safeNumber(op.verticalGrace, 0.16);
    this.rotationSpeed = safeNumber(op.rotationSpeed, this.rotationSpeed) || this.rotationSpeed;
    this.heesHawveh = true;
    this.__spawnPosition = { ...(op.position || {}) };
    this.__spawnScale = { ...(op.scale || { x: 1, y: 1, z: 1 }) };
    this.bindCoinLife();
  }

  bindCoinLife() {
    this.on("ready", () => this.preparePerutah());
    this.on("heesHawvoos", me => this.animatePerutah(me));
    this.on("nivraNeechnas", nivra => { if (this.cannotCollect(nivra)) return this.clearLockedTouch(); this.__collecting = true; this.collectFor(nivra); });
    this.on("collected", n => n?.playSound?.("awtsmoos://dingSound", { layerName: "audio effects layer 1", loop: false }));
  }

  isCollectionLocked() { return Boolean(this.olam?.__spikeDeathActive || this.olam?.__perutahResetLock); }
  cannotCollect(nivra) { return this.__needsFreshEntry || this.__collecting || this.__collected || nivra?.type !== "chossid" || this.isCollectionLocked(); }
  clearLockedTouch() { if (!this.isCollectionLocked() && !this.__needsFreshEntry) return false; this.objectsCollidingWith = []; return false; }

  exactTouch(nivra, extraRadius = 0) {
    if (!this.proximityCollider || !nivra?.collider) return false;
    const center = this.proximityCollider.center;
    const range = capsuleYRange(nivra.collider);
    if (center.y < range.min - this.verticalGrace || center.y > range.max + this.verticalGrace) return false;
    const radius = Math.max(0.22, this.proximityCollider.radius + extraRadius);
    return Utils.capsuleSphereColliding(nivra.collider, { center, radius });
  }

  checkProximitySoul(nivra) {
    if (this.isCollectionLocked()) { this.objectsCollidingWith = []; return; }
    if (this.__needsFreshEntry) { this.objectsCollidingWith = []; if (this.exactTouch(nivra, 0.04)) return; this.__needsFreshEntry = false; return; }
    if (nivra === this || !this.isCapsuleOwner(nivra)) return;
    const already = this.objectsCollidingWith.includes(nivra);
    const collides = this.exactTouch(nivra, already ? 0.05 : 0);
    if (collides && !already) return this.enterProximity(nivra);
    if (!collides && already) this.leaveProximity(nivra);
  }

  preparePerutah() {
    if (!this.mesh) return;
    this.mesh.rotation.z = Math.PI / 2;
    this.__spawnPosition = { x: this.mesh.position.x, y: this.mesh.position.y, z: this.mesh.position.z };
    this.__spawnScale = { x: this.mesh.scale.x || 1, y: this.mesh.scale.y || 1, z: this.mesh.scale.z || 1 };
    markCoinVisual(this.mesh);
    applyCopperMaterial(this.mesh);
  }

  animatePerutah(me) {
    if (!me?.mesh) return;
    if (this.isCollectionLocked() || this.__needsFreshEntry) this.objectsCollidingWith = [];
    if (!this.__collecting) { me.mesh.rotation.y += this.rotationSpeed; me.mesh.rotation.x = Math.sin((performance.now?.() || Date.now()) * 0.003) * 0.06; return; }
    me.mesh.scale.multiplyScalar(0.84);
    if (me.mesh.scale.x < 0.06) this.hideCollectedPerutah();
  }

  hideCollectedPerutah() {
    this.__collecting = false;
    this.__collected = true;
    this.__needsFreshEntry = false;
    this.objectsCollidingWith = [];
    setTreeVisible(this.mesh, false);
    setTreeVisible(this.modelMesh, false);
    this.mesh?.scale?.set?.(0.001, 0.001, 0.001);
  }

  resetForLevelRestart() {
    this.__collecting = false; this.__collected = false; this.__needsFreshEntry = true; this.wasSealayked = false; this.__awtsmoosSealayking = false; this.objectsCollidingWith = []; this.proximityCollider = null; this.heesHawveh = true;
    const p = this.__spawnPosition || this.position || { x: 0, y: 0, z: 0 };
    const s = this.__spawnScale || { x: 1, y: 1, z: 1 };
    this.mesh?.position?.set?.(safeNumber(p.x), safeNumber(p.y), safeNumber(p.z));
    this.mesh?.scale?.set?.(safeNumber(s.x, 1), safeNumber(s.y, 1), safeNumber(s.z, 1));
    setTreeVisible(this.mesh, true); setTreeVisible(this.modelMesh, true); markCoinVisual(this.mesh); applyCopperMaterial(this.mesh);
  }

  collectFor(nivra) {
    this.ayshPeula("collected", this, nivra);
    const olam = this.olam;
    const requiredPerutos = safeNumber(olam?.requiredPerutos, 9) || 9;
    const perutahEpoch = safeNumber(olam?.__perutahResetEpoch, 0);
    olam.__levelPerutosCollected = safeNumber(olam?.__levelPerutosCollected, 0) + this.value;
    olam.__globalPerutosCollected = safeNumber(olam?.__globalPerutosCollected, 0) + this.globalValue;
    const globalCoins = this.readGlobalCoinsSafely() + this.globalValue;
    this.writeGlobalCoinsSafely(globalCoins);
    const payload = { levelKey: olam?.sourcePath || "ladder-1.json", requiredPerutos, collected: olam.__levelPerutosCollected, added: this.value, globalCoins, globalAdded: this.globalValue, perutahEpoch };
    olam?.ayshPeula?.("ui event", "perutahProgress", payload);
    olam?.ayshPeula?.("ui event", "gameHUD", { perutahProgress: payload });
    olam?.ayshPeula?.("ui event", "effectsOverlay", { effect: "transaction", text: "+1 Copper Perutah", color: "#e4a15c" });
  }

  readGlobalCoinsSafely() { try { return safeNumber(globalThis.localStorage?.getItem("awtsmoosMitzvahGlobalCoins"), 0); } catch { return 0; } }
  writeGlobalCoinsSafely(globalCoins) { try { globalThis.localStorage?.setItem("awtsmoosMitzvahGlobalCoins", String(globalCoins)); } catch {} }
}
