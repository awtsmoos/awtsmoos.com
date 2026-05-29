// B"H
import Tzomayach from "../../chayim/tzomayach.js";
import * as THREE from "/games/scripts/build/three.module.js";

/**
 * @file FallResetTrigger.js
 * @description Chapter 65: lava becomes reset with memory burned clean. The
 * Awtsmoos turns falling into Hebrew letters and blocks for three seconds, then
 * clears the level counters, tzedakah blessing, mezuzah readiness, and any
 * level-scoped storage shadows before reloading the full level vessel.
 */
const LETTERS = Object.freeze(["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ", "ק", "ר", "ש", "ת"]);
const RESET_DELAY_MS = 3000;

export default class FallResetTrigger extends Tzomayach {
  type = "fallResetTrigger";
  static itemName = "Lava Letter Reset Trigger";

  /** @param {object} op JSON options. @param {object} olam Runtime world. */
  constructor(op = {}, olam) {
    op.interactable = true;
    op.proximity = op.proximity || 8;
    op.isSolid = false;
    op.golem = op.golem || {
      guf: { BoxGeometry: [op.width || 120, op.height || 0.4, op.depth || 90] },
      toyr: { MeshBasicMaterial: { color: op.color || 0x220000, transparent: true, opacity: op.opacity ?? 0.12 } }
    };
    super(op, olam);
    this.resetDelayMs = op.resetDelayMs || RESET_DELAY_MS;
    this._triggered = false;
    this._particles = [];
    this.heesHawveh = true;
    this.on("ready", () => this.prepareTriggerMesh());
    this.on("nivraNeechnas", nivra => this.tryReset(nivra, "נגעת בלבה"));
  }

  /** @returns {void} Keeps the trigger from becoming solid collision. */
  prepareTriggerMesh() {
    if (!this.mesh) return;
    this.mesh.userData.isSolid = false;
    this.mesh.userData.addToOctree = false;
  }

  /** @returns {void} Checks falling below the route. */
  heesHawvoos() {
    this.animateParticles();
    const player = this.olam?.chossid;
    const y = player?.mesh?.position?.y;
    if (Number.isFinite(y) && y < (this.mesh?.position?.y || -10) + 3) this.tryReset(player, "נפלת אל אש האותיות");
  }

  /** @param {object} nivra Runtime being. @param {string} reason Hebrew reason. @returns {void} */
  tryReset(nivra, reason) {
    if (this._triggered || nivra?.type !== "chossid") return;
    this._triggered = true;
    this.resetLevelStateNow();
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: `${reason}! הכל מתאפס בעוד 3...`, color: "#ffcc55" });
    this.spawnLetterExplosion(nivra?.mesh?.position || this.mesh?.position || new THREE.Vector3());
    setTimeout(() => this.reloadFreshLevel(), this.resetDelayMs);
  }

  /** @returns {void} Clears runtime counters so all level coins/pushkuh state reset. */
  resetLevelStateNow() {
    if (!this.olam) return;
    this.olam.__levelPerutosCollected = 0;
    this.olam.__tzedakahBlessed = false;
    this.olam.__insideRightPostMezuzahs = [];
    this.clearLevelScopedStorage();
    this.olam?.ayshPeula?.("ui event", "perutahProgress", { collected: 0, requiredPerutos: this.olam.requiredPerutos || 0, reset: true });
  }

  /** @returns {void} Removes only level-scoped storage keys, not global totals. */
  clearLevelScopedStorage() {
    const source = String(this.olam?.sourcePath || "ladder").replace(/[^\w.-]/g, "_");
    const prefixes = [`awtsmoosLevel:${source}`, `mitzvahWorld:${source}`, `ladder:${source}`];
    try {
      for (let i = globalThis.localStorage.length - 1; i >= 0; i -= 1) {
        const key = globalThis.localStorage.key(i);
        if (prefixes.some(prefix => key?.startsWith(prefix))) globalThis.localStorage.removeItem(key);
      }
    } catch {}
  }

  /** @returns {void} Reloads from the server, bypassing stale in-page object state. */
  reloadFreshLevel() {
    try { globalThis.location?.reload?.(); } catch {}
  }

  /** @param {THREE.Vector3} origin Player/lava origin. @returns {void} */
  spawnLetterExplosion(origin) {
    const scene = this.olam?.scene || this.mesh?.parent;
    if (!scene) return;
    for (let i = 0; i < 34; i += 1) scene.add(this.createParticle(origin, i));
  }

  /** @param {THREE.Vector3} origin Origin. @param {number} index Particle index. @returns {THREE.Mesh} */
  createParticle(origin, index) {
    const isLetter = index % 3 !== 0;
    const mesh = isLetter ? this.makeLetterParticle(index) : this.makeBlockParticle(index);
    mesh.position.copy(origin);
    mesh.position.y += 0.8;
    mesh.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.32, 0.12 + Math.random() * 0.26, (Math.random() - 0.5) * 0.32);
    mesh.userData.birth = performance.now?.() || Date.now();
    mesh.userData.life = 2900;
    this._particles.push(mesh);
    return mesh;
  }

  /** @param {number} index Particle index. @returns {THREE.Mesh} */
  makeLetterParticle(index) {
    const canvas = document.createElement("canvas");
    canvas.width = 96; canvas.height = 96;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(255,120,20,0.12)"; ctx.fillRect(0, 0, 96, 96);
    ctx.font = "bold 68px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = index % 2 ? "#ffd54a" : "#ff6b2a";
    ctx.fillText(LETTERS[index % LETTERS.length], 48, 52);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
    return new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), material);
  }

  /** @param {number} index Particle index. @returns {THREE.Mesh} */
  makeBlockParticle(index) {
    const material = new THREE.MeshLambertMaterial({ color: index % 2 ? 0xff5122 : 0xffd54a, emissive: 0x661100 });
    return new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), material);
  }

  /** @returns {void} Moves letters and blocks while waiting to reset. */
  animateParticles() {
    const now = performance.now?.() || Date.now();
    this._particles = this._particles.filter(mesh => {
      const age = now - mesh.userData.birth;
      if (age > mesh.userData.life) { mesh.parent?.remove(mesh); return false; }
      mesh.position.add(mesh.userData.velocity);
      mesh.userData.velocity.y -= 0.006;
      mesh.rotation.x += 0.045; mesh.rotation.y += 0.035;
      const scale = Math.max(0.05, 1 - age / mesh.userData.life);
      mesh.scale.setScalar(scale);
      return true;
    });
  }
}
