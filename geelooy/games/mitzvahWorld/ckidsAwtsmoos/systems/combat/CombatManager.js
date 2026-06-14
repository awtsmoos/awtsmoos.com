// B"H
/**
 * @file CombatManager.js
 * @description
 * Chapter 709: attacks obey selected targets, not camera coincidence.
 * Mobile may tap a fox, see the golden ring, and then attack immediately; the
 * shot bends to that chosen living vessel even when the camera is not perfect.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import HebrewProjectileSystem from "./HebrewProjectileSystem.js";
import HealthBarSystem from "./HealthBarSystem.js";
import CombatTargeting, { collectCombatTargets } from "./CombatTargeting.js?v=mobile-wildlife-targets-20260614-bh1";
import { WEAPON_REGISTRY } from "./WeaponRegistry.js";
function live(t) { return t?.mesh && !t.isDead && Number(t.hp ?? 1) > 0; }
function dist(a, b) { return a?.distanceTo?.(b) ?? Infinity; }
export default class CombatManager {
  constructor(olam) { this.olam = olam; this.projectiles = new HebrewProjectileSystem(olam); this.healthBars = new HealthBarSystem(); this.targeting = new CombatTargeting(olam, t => this.onTargetChanged(t)); this.equippedWeapon = null; this.lastAttackTime = 0; this.enemies = []; this.initialized = false; this.lastUnitFrameAt = 0; }
  init() { if (this.initialized) return; this.initialized = true; this.equipWeapon("cherev_hakodesh", { silent: true }); if (typeof document === "undefined") return; this._onKeyDown = e => { const keys = { "1": "cherev_hakodesh", "2": "keshes_haemes", "3": "mateh_hatorah" }; if (keys[e.key]) this.equipWeapon(keys[e.key]); if (e.code === "KeyV") this.attack({ source: "keyboard" }); }; document.addEventListener("keydown", this._onKeyDown); }
  equipWeapon(id, options = {}) { const def = WEAPON_REGISTRY[id]; if (!def) return; this.equippedWeapon = def; if (!options.silent) this.olam?.ayshPeula?.("ui event", "toast", { message: `B"H - Equipped: ${def.icon} ${def.name}` }); }
  targets() { return collectCombatTargets(this.olam, this.enemies); }
  attack(options = {}) {
    this.equippedWeapon ||= WEAPON_REGISTRY.cherev_hakodesh; const player = this.player(); if (!player?.mesh) return;
    const now = Date.now() / 1000; if (now - this.lastAttackTime < this.equippedWeapon.attackSpeed) return; this.lastAttackTime = now;
    const cost = Number(this.equippedWeapon.koachCost || 0), current = Number(player.koach ?? player.maxKoach ?? 100); if (current < cost) return void this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: "LOW KOACH", color: "#70b7ff" });
    player.koach = Math.max(0, current - cost); player.updateStatsUI?.();
    const origin = player.mesh.position.clone(); origin.y += 1.5;
    const fallback = this.cameraDirection(player); const target = this.bestTarget(origin, fallback);
    const direction = target?.mesh ? target.mesh.position.clone().add(new THREE.Vector3(0, .7, 0)).sub(origin).normalize() : fallback;
    if (target) this.targeting.set(target); this.facePlayerToward(player, direction);
    this.projectiles.fire(this.equippedWeapon, origin, direction.normalize());
    if (!options.quiet) this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: this.equippedWeapon.projectile?.letter || "ATTACK", color: "#ffe680" });
  }
  cameraDirection(player) { const d = new THREE.Vector3(0, 0, -1); if (this.olam.camera) d.applyQuaternion(this.olam.camera.quaternion); else d.applyEuler(player.mesh.rotation); d.y = 0; return d.lengthSq() > .0001 ? d.normalize() : new THREE.Vector3(0, 0, -1); }
  bestTarget(origin, fallback) { const selected = this.targeting.selected; if (live(selected) && dist(origin, selected.mesh.position) <= (this.equippedWeapon?.range || 50) + 10) return selected; let best = null, score = Infinity; for (const t of this.targets()) { if (!live(t)) continue; const to = t.mesh.position.clone().sub(origin), d = to.length(); if (d < .01 || d > (this.equippedWeapon?.range || 50) + 12) continue; const angle = fallback.angleTo(to.clone().normalize()); const s = d * .08 + angle * 12; if (d < 12 || angle < 1.45) if (s < score) { best = t; score = s; } } return best; }
  facePlayerToward(player, direction) { const yaw = Math.atan2(direction.x, direction.z) + Math.PI; if (Number.isFinite(yaw)) { player.__awtsmoosForcedFacingYaw = yaw; player.__awtsmoosForcedFacingUntil = Date.now() + 650; } }
  registerEnemy(enemy) { if (enemy && !this.enemies.includes(enemy)) this.enemies.push(enemy); if (enemy) this.healthBars.createBar(enemy); }
  unregisterEnemy(enemy) { if (!enemy) return; if (this.targeting.selected === enemy) this.targeting.set(null); this.healthBars.removeBar(enemy.name); const i = this.enemies.indexOf(enemy); if (i >= 0) this.enemies.splice(i, 1); }
  player() { return this.olam?.player || this.olam?.chossid || null; }
  selectTargetFromPointer() { return this.targeting.selectFromPointer(this.targets()); }
  onTargetChanged(target) { this.healthBars.setSelected(target); this.emitUnitFrames(true); if (target) this.olam?.ayshPeula?.("ui event", "toast", { message: `B"H - Target: ${target.name}. Tap ATK to attack.` }); }
  unitFramePayload() { const p = this.player(), s = p?.currentStats || {}, t = this.targeting.selected; return { player: { name: p?.displayName || "Chossid", hp: Number(p?.hp ?? s.health ?? 100), maxHp: Number(p?.maxHp ?? s.maxHealth ?? s.health ?? 100), koach: Number(p?.koach ?? 0), maxKoach: Number(p?.maxKoach ?? 100), level: Number(p?.level || 1) }, target: live(t) ? { name: t.name, species: t.def?.species || "target", hp: Number(t.hp || 0), maxHp: Number(t.maxHp || 1), color: Number(t.def?.color || 0x9a6238) } : null }; }
  emitUnitFrames(force = false) { const now = performance.now(); if (!force && now - this.lastUnitFrameAt < 100) return; this.lastUnitFrameAt = now; this.olam?.ayshPeula?.("ui event", "combatUnitFrames", this.unitFramePayload()); }
  update(dt) { if (!this.initialized) return; this.targeting.update(); const p = this.player(); if (p && Number.isFinite(Number(p.maxKoach))) p.koach = Math.min(Number(p.maxKoach), Number(p.koach || 0) + dt * 4); this.emitUnitFrames(); this.projectiles.update(dt, this.targets()); this.healthBars.update(this.olam?.camera); this.enemies = this.enemies.filter(e => live(e)); }
  dispose() { this.projectiles.dispose(); this.healthBars.dispose(); this.targeting.dispose(); if (typeof document !== "undefined") document.removeEventListener("keydown", this._onKeyDown); }
}
