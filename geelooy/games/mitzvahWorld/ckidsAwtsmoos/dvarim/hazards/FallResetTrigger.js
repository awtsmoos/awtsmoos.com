// B"H
import Tzomayach from "../../chayim/tzomayach.js";
import * as THREE from "/games/scripts/build/three.module.js";

/**
 * @file FallResetTrigger.js
 * @description
 * Chapter 2: In the worker realm there is no document, no windowed parchment,
 * no canvas born from DOM. The Awtsmoos therefore engraves reset sparks with
 * pure THREE vessels: rings, blocks, and glowing planes that exist in browser
 * and worker alike. The fall no longer tears the boot; it becomes a measured
 * descent and a clean rebirth.
 */
const RESET_DELAY_MS = 3000;

/** @param {*} value Candidate number. @param {number} fallback Safe value. @returns {number} */
function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

/** @param {number} index Particle index. @returns {THREE.Material} */
function makeSparkMaterial(index) {
  return new THREE.MeshBasicMaterial({
    color: index % 2 ? 0xffd35c : 0xff6b2a,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide
  });
}

export default class FallResetTrigger extends Tzomayach {
  type = "fallResetTrigger";
  static itemName = "Lava Reset Trigger";

  /** @param {object} op JSON options. @param {object} olam Runtime world. */
  constructor(op = {}, olam) {
    op.interactable = true;
    op.proximity = op.proximity || 8;
    op.isSolid = false;
    op.golem = op.golem || {
      guf: { BoxGeometry: [op.width || 120, op.height || 0.4, op.depth || 90] },
      toyr: { MeshBasicMaterial: { color: op.color || 0x220000, transparent: true, opacity: op.opacity ?? 0.1 } }
    };
    super(op, olam);
    this.resetDelayMs = op.resetDelayMs || RESET_DELAY_MS;
    this._triggered = false;
    this._particles = [];
    this.heesHawveh = true;
    this.on("ready", () => this.prepareTriggerMesh());
    this.on("nivraNeechnas", nivra => this.tryReset(nivra, "נפלת"));
  }

  /** @returns {void} Prevents lava/reset planes from entering collision octrees. */
  prepareTriggerMesh() {
    if (!this.mesh) return;
    this.mesh.userData.isSolid = false;
    this.mesh.userData.addToOctree = false;
  }

  /** @returns {void} Checks below-world falls and animates reset sparks. */
  heesHawvoos() {
    this.animateParticles();
    const y = this.olam?.chossid?.mesh?.position?.y;
    const threshold = finite(this.mesh?.position?.y, -10) + 3;
    if (Number.isFinite(y) && y < threshold) this.tryReset(this.olam.chossid, "נפלת אל עומק העולם");
  }

  /** @param {object} nivra Runtime being. @param {string} reason Reset reason. @returns {void} */
  tryReset(nivra, reason) {
    if (this._triggered || nivra?.type !== "chossid") return;
    this._triggered = true;
    this.resetLevelStateNow();
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: `${reason}! מתחילים מחדש...`, color: "#ffcc55" });
    this.spawnSparkBurst(nivra?.mesh?.position || this.mesh?.position || new THREE.Vector3());
    setTimeout(() => this.reloadFreshLevel(), this.resetDelayMs);
  }

  /** @returns {void} Clears level-scoped counters without touching global coins. */
  resetLevelStateNow() {
    if (!this.olam) return;
    this.olam.__levelPerutosCollected = 0;
    this.olam.__tzedakahBlessed = false;
    this.olam.__insideRightPostMezuzahs = [];
    this.olam?.ayshPeula?.("ui event", "perutahProgress", { collected: 0, requiredPerutos: this.olam.requiredPerutos || 0, reset: true });
  }

  /** @returns {void} Reloads the route from a clean state. */
  reloadFreshLevel() {
    try { globalThis.location?.reload?.(); } catch {}
  }

  /** @param {THREE.Vector3} origin Burst origin. @returns {void} */
  spawnSparkBurst(origin) {
    const scene = this.olam?.scene || this.mesh?.parent;
    if (!scene) return;
    for (let i = 0; i < 28; i += 1) scene.add(this.createParticle(origin, i));
  }

  /** @param {THREE.Vector3} origin Origin. @param {number} index Index. @returns {THREE.Mesh} */
  createParticle(origin, index) {
    const geometry = index % 3 ? new THREE.RingGeometry(0.16, 0.34, 6) : new THREE.BoxGeometry(0.28, 0.28, 0.28);
    const mesh = new THREE.Mesh(geometry, makeSparkMaterial(index));
    mesh.position.copy(origin).add(new THREE.Vector3(0, 0.8, 0));
    mesh.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.3, 0.12 + Math.random() * 0.22, (Math.random() - 0.5) * 0.3);
    mesh.userData.birth = performance.now?.() || Date.now();
    mesh.userData.life = 2400;
    this._particles.push(mesh);
    return mesh;
  }

  /** @returns {void} Moves sparks until they fade. */
  animateParticles() {
    const now = performance.now?.() || Date.now();
    this._particles = this._particles.filter(mesh => {
      const age = now - finite(mesh.userData.birth, now);
      if (age > finite(mesh.userData.life, 1)) { mesh.parent?.remove(mesh); return false; }
      mesh.position.add(mesh.userData.velocity);
      mesh.userData.velocity.y -= 0.006;
      mesh.rotation.x += 0.045;
      mesh.rotation.y += 0.035;
      mesh.scale.setScalar(Math.max(0.05, 1 - age / mesh.userData.life));
      return true;
    });
  }
}
