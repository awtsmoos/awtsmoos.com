// B"H
/**
 * @file FallResetTrigger.js
 * @description
 * Chapter 77: A fall now charges the personal purse. The Awtsmoos restores the
 * level coins, clears the tzedakah blessing, and tells the HUD to remove one
 * owned perutah from the player's private inventory.
 */
import Tzomayach from "../../chayim/tzomayach.js";
import * as THREE from "/games/scripts/build/three.module.js";

const RESET_DELAY_MS = 3000;
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
function sparkMat(index) { return new THREE.MeshBasicMaterial({ color: index % 2 ? 0xffd35c : 0xff6b2a, transparent: true, opacity: 0.88, side: THREE.DoubleSide }); }
function resetPerutos(olam) { let restored = 0; olam?.nivrayim?.forEach?.(nivra => { if (nivra?.type !== "coin") return; nivra.resetForLevelRestart?.(); restored += 1; }); return restored; }

export default class FallResetTrigger extends Tzomayach {
  type = "fallResetTrigger"; static itemName = "Lava Reset Trigger";
  constructor(op = {}, olam) { op.interactable = true; op.proximity = op.proximity || 8; op.isSolid = false; op.golem ||= { guf: { BoxGeometry: [op.width || 120, op.height || 0.4, op.depth || 90] }, toyr: { MeshBasicMaterial: { color: op.color || 0x220000, transparent: true, opacity: op.opacity ?? 0.1 } } }; super(op, olam); this.resetDelayMs = op.resetDelayMs || RESET_DELAY_MS; this.personalLoss = Number(op.personalLoss || 1); this._triggered = false; this._particles = []; this.heesHawveh = true; this.on("ready", () => this.prepareTriggerMesh()); this.on("nivraNeechnas", nivra => this.tryReset(nivra, "נפלת")); }
  prepareTriggerMesh() { if (!this.mesh) return; this.mesh.userData.isSolid = false; this.mesh.userData.addToOctree = false; }
  heesHawvoos() { this.animateParticles(); const y = this.olam?.chossid?.mesh?.position?.y; const threshold = finite(this.mesh?.position?.y, -10) + 3; if (Number.isFinite(y) && y < threshold) this.tryReset(this.olam.chossid, "נפלת אל עומק העולם"); }
  tryReset(nivra, reason) { if (this._triggered || nivra?.type !== "chossid") return; this._triggered = true; this.resetLevelStateNow(); this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: `${reason}! -${this.personalLoss} personal perutah`, color: "#ffcc55" }); this.spawnSparkBurst(nivra?.mesh?.position || this.mesh?.position || new THREE.Vector3()); setTimeout(() => this.reloadFreshLevel(), this.resetDelayMs); }
  resetLevelStateNow() { if (!this.olam) return; this.olam.__levelPerutosCollected = 0; this.olam.__tzedakahBlessed = false; this.olam.__tzedakahDonation = 0; this.olam.__personalRewardPaid = false; const restoredPerutos = resetPerutos(this.olam); const base = { collected: 0, requiredPerutos: this.olam.requiredPerutos || 0, reset: true, restoredPerutos, personalDelta: -Math.abs(this.personalLoss), reason: "fall" }; this.olam?.ayshPeula?.("ui event", "perutahProgress", base); this.olam?.ayshPeula?.("ui event", "gameHUD", { perutahProgress: base, personalPerutas: base }); }
  reloadFreshLevel() { try { globalThis.location?.reload?.(); } catch {} }
  spawnSparkBurst(origin) { const scene = this.olam?.scene || this.mesh?.parent; if (!scene) return; for (let i = 0; i < 28; i += 1) scene.add(this.createParticle(origin, i)); }
  createParticle(origin, index) { const geometry = index % 3 ? new THREE.RingGeometry(0.16, 0.34, 6) : new THREE.BoxGeometry(0.28, 0.28, 0.28); const mesh = new THREE.Mesh(geometry, sparkMat(index)); mesh.position.copy(origin).add(new THREE.Vector3(0, 0.8, 0)); mesh.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.3, 0.12 + Math.random() * 0.22, (Math.random() - 0.5) * 0.3); mesh.userData.birth = performance.now?.() || Date.now(); mesh.userData.life = 2400; this._particles.push(mesh); return mesh; }
  animateParticles() { const now = performance.now?.() || Date.now(); this._particles = this._particles.filter(mesh => { const age = now - finite(mesh.userData.birth, now); if (age > finite(mesh.userData.life, 1)) { mesh.parent?.remove(mesh); return false; } mesh.position.add(mesh.userData.velocity); mesh.userData.velocity.y -= 0.006; mesh.rotation.x += 0.045; mesh.rotation.y += 0.035; mesh.scale.setScalar(Math.max(0.05, 1 - age / mesh.userData.life)); return true; }); }
}
