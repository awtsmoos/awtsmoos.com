// B"H
/**
 * @file CombatManager.js
 * @description
 * Chapter 710: selection is required and facing is the gate.
 * The Awtsmoos no longer auto-picks the nearest fox. A target must be selected,
 * close enough, alive, and inside the player's facing cone before attack fires.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import HebrewProjectileSystem from "./HebrewProjectileSystem.js";
import HealthBarSystem from "./HealthBarSystem.js";
import CombatTargeting, { collectCombatTargets } from "./CombatTargeting.js?v=mobile-wildlife-targets-20260614-bh1";
import { WEAPON_REGISTRY } from "./WeaponRegistry.js";
function live(t) { return t?.mesh && !t.isDead && Number(t.hp ?? 1) > 0; }
function toast(olam, text, color = "#ffe680") { olam?.ayshPeula?.("ui event", "effectsOverlay", { text, color }); }
export default class CombatManager {
  constructor(olam) { this.olam = olam; this.projectiles = new HebrewProjectileSystem(olam); this.healthBars = new HealthBarSystem(); this.targeting = new CombatTargeting(olam, t => this.onTargetChanged(t)); this.equippedWeapon = null; this.lastAttackTime = 0; this.enemies = []; this.initialized = false; this.lastUnitFrameAt = 0; }
  init() { if (this.initialized) return; this.initialized = true; this.equipWeapon("cherev_hakodesh", { silent: true }); if (typeof document === "undefined") return; this._onKeyDown = e => { const keys = { "1": "cherev_hakodesh", "2": "keshes_haemes", "3": "mateh_hatorah" }; if (keys[e.key]) this.equipWeapon(keys[e.key]); if (e.code === "KeyV") this.attack({ source: "keyboard" }); }; document.addEventListener("keydown", this._onKeyDown); }
  equipWeapon(id, options = {}) { const def = WEAPON_REGISTRY[id]; if (!def) return; this.equippedWeapon = def; if (!options.silent) this.olam?.ayshPeula?.("ui event", "toast", { message: `B"H - Equipped: ${def.icon} ${def.name}` }); }
  targets() { return collectCombatTargets(this.olam, this.enemies); }
  attack(options = {}) {
    this.equippedWeapon ||= WEAPON_REGISTRY.cherev_hakodesh; const player = this.player(); if (!player?.mesh) return;
    const target = this.targeting.selected;
    if (!live(target)) return void toast(this.olam, "SELECT TARGET", "#ffd966");
    const origin = player.mesh.position.clone(); origin.y += 1.5;
    const aim = target.mesh.position.clone().add(new THREE.Vector3(0, .7, 0)).sub(origin); const distance = aim.length();
    if (distance > (this.equippedWeapon.range || 50)) return void toast(this.olam, "TOO FAR", "#70b7ff");
    const forward = this.playerFacingDirection(player), dir = aim.clone().setY(0).normalize();
    const dot = forward.dot(dir);
    if (dot < 0.58) { this.markNeedsFacing(player, target); return void toast(this.olam, "FACE TARGET", "#ffcf45"); }
    const now = Date.now() / 1000; if (now - this.lastAttackTime < this.equippedWeapon.attackSpeed) return; this.lastAttackTime = now;
    const cost = Number(this.equippedWeapon.koachCost || 0), current = Number(player.koach ?? player.maxKoach ?? 100); if (current < cost) return void toast(this.olam, "LOW KOACH", "#70b7ff");
    player.koach = Math.max(0, current - cost); player.updateStatsUI?.();
    this.projectiles.fire(this.equippedWeapon, origin, aim.normalize());
    if (!options.quiet) toast(this.olam, this.equippedWeapon.projectile?.letter || "ATTACK", "#ffe680");
  }
  playerFacingDirection(player) {
    const yaw = Number.isFinite(player.__awtsmoosUnifiedFacingYaw) ? player.__awtsmoosUnifiedFacingYaw : (player.mesh.rotation.y || 0);
    return new THREE.Vector3(Math.sin(yaw + Math.PI), 0, Math.cos(yaw + Math.PI)).normalize();
  }
  markNeedsFacing(player, target) { const d = target.mesh.position.clone().sub(player.mesh.position); d.y = 0; const yaw = Math.atan2(d.x, d.z) + Math.PI; if (Number.isFinite(yaw)) { player.__awtsmoosDesiredAttackFacingYaw = yaw; player.__awtsmoosDesiredAttackTarget = target.name; } }
  registerEnemy(enemy) { if (enemy && !this.enemies.includes(enemy)) this.enemies.push(enemy); if (enemy) this.healthBars.createBar(enemy); }
  unregisterEnemy(enemy) { if (!enemy) return; if (this.targeting.selected === enemy) this.targeting.set(null); this.healthBars.removeBar(enemy.name); const i = this.enemies.indexOf(enemy); if (i >= 0) this.enemies.splice(i, 1); }
  player() { return this.olam?.player || this.olam?.chossid || null; }
  selectTargetFromPointer() { return this.targeting.selectFromPointer(this.targets()); }
  onTargetChanged(target) { this.healthBars.setSelected(target); this.emitUnitFrames(true); if (target) this.olam?.ayshPeula?.("ui event", "toast", { message: `B"H - Target: ${target.name}. Face it, then tap ATK.` }); }
  unitFramePayload() { const p = this.player(), s = p?.currentStats || {}, t = this.targeting.selected; return { player: { name: p?.displayName || "Chossid", hp: Number(p?.hp ?? s.health ?? 100), maxHp: Number(p?.maxHp ?? s.maxHealth ?? s.health ?? 100), koach: Number(p?.koach ?? 0), maxKoach: Number(p?.maxKoach ?? 100), level: Number(p?.level || 1) }, target: live(t) ? { name: t.name, species: t.def?.species || "target", hp: Number(t.hp || 0), maxHp: Number(t.maxHp || 1), color: Number(t.def?.color || 0x9a6238) } : null }; }
  emitUnitFrames(force = false) { const now = performance.now(); if (!force && now - this.lastUnitFrameAt < 100) return; this.lastUnitFrameAt = now; this.olam?.ayshPeula?.("ui event", "combatUnitFrames", this.unitFramePayload()); }
  update(dt) { if (!this.initialized) return; this.targeting.update(); const p = this.player(); if (p && Number.isFinite(Number(p.maxKoach))) p.koach = Math.min(Number(p.maxKoach), Number(p.koach || 0) + dt * 4); this.emitUnitFrames(); this.projectiles.update(dt, this.targets()); this.healthBars.update(this.olam?.camera); this.enemies = this.enemies.filter(e => live(e)); }
  dispose() { this.projectiles.dispose(); this.healthBars.dispose(); this.targeting.dispose(); if (typeof document !== "undefined") document.removeEventListener("keydown", this._onKeyDown); }
}
