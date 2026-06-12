// B"H
/**
 * @file VillageAnimalMob.js
 * @description
 * Chapter 704: the ring is broken, the bite becomes real.
 * The old fox circled outside its own attack range because `preferredRange` was
 * larger than `attackRange`. The Awtsmoos now gives the creature phases:
 * patrol, chase, windup, strike, recover. It warns, lunges, damages, flashes,
 * and backs away without melting into the player.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { getVillageGroundNavigator } from "./VillageGroundNavigator.js";
import { createVillageAnimal, disposeVillageAnimal } from "./VillageAnimalFactory.js";

const scratch = new THREE.Vector3();
const away = new THREE.Vector3();
const nowSeconds = () => (globalThis.performance?.now?.() || Date.now()) / 1000;
const nowMs = () => globalThis.performance?.now?.() || Date.now();
const n = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const v3 = (p = {}) => new THREE.Vector3(Number(p.x) || 0, Number(p.y) || 0, Number(p.z) || 0);

const ATTACKS = {
  fox: { name: "snap", color: "#ff9b45", windupRange: 2.85, hitRange: 2.35, cooldown: 1.05, windup: 0.22, strike: 0.18, recover: 0.48, lungeSpeed: 8.8 },
  wolf: { name: "lunge", color: "#d7e6ff", windupRange: 3.15, hitRange: 2.65, cooldown: 1.25, windup: 0.26, strike: 0.22, recover: 0.55, lungeSpeed: 9.2 },
  ram: { name: "bash", color: "#fff0a8", windupRange: 3.35, hitRange: 2.9, cooldown: 1.45, windup: 0.34, strike: 0.24, recover: 0.62, lungeSpeed: 8.0 },
  stag: { name: "antler sweep", color: "#c9ff9d", windupRange: 3.55, hitRange: 3.05, cooldown: 1.55, windup: 0.36, strike: 0.26, recover: 0.64, lungeSpeed: 8.4 }
};

function playerPosition(player) { return player?.mesh?.position || player?.modelMesh?.position || player?.guf?.position || null; }
function setEmissive(root, color) { const hex = new THREE.Color(color).getHex(); root?.traverse?.(child => child.material?.emissive?.setHex?.(hex)); }
function clearEmissive(root) { root?.traverse?.(child => child.material?.emissive?.setHex?.(0x000000)); }
function distanceToPlayer(mob, player) { const p = playerPosition(player); return p && mob.mesh ? mob.mesh.position.distanceTo(p) : Infinity; }
function safeDamage(player, amount, olam) {
  if (typeof player?.takeDamage === "function") return player.takeDamage(amount);
  const stats = player?.currentStats; if (!stats) return 0;
  stats.maxHealth ||= 100; stats.health = Math.max(0, n(stats.health, stats.maxHealth) - amount);
  olam?.ayshPeula?.("ui event", "gameHUD", { updateStats: { hp: stats.health, maxHp: stats.maxHealth } });
  return amount;
}

export default class VillageAnimalMob {
  /** @param {object} olam World. @param {object} def Authored mob definition. @param {object} state Shared quest state. */
  constructor(olam, def, state) {
    this.olam = olam; this.def = def; this.state = state; this.id = def.id; this.name = def.name;
    this.type = "mazik"; this.elementalType = "wildAnimal"; this.species = def.species || "fox";
    this.hp = n(def.hp, 60); this.maxHp = this.hp; this.damage = n(def.damage, 8);
    this.xpValue = n(def.xp, 25); this.perutas = n(def.perutas, 3); this.speed = n(def.speed, 3.7);
    this.groundLift = n(def.groundLift, 0.28); this.aggroRange = n(def.aggro, 18);
    this.attackData = { ...ATTACKS[this.species] || ATTACKS.fox };
    this.windupRange = n(def.windupRange, this.attackData.windupRange);
    this.hitRange = n(def.hitRange, n(def.attackRange, this.attackData.hitRange));
    this.chaseStopDistance = n(def.chaseStopDistance, Math.max(1.05, this.hitRange * 0.68));
    this.attackCooldown = n(def.attackCooldown, this.attackData.cooldown);
    this.spawn = v3(def.position); this.target = this.spawn.clone(); this.clock = Math.random() * 100;
    this.stateName = "patrol"; this.stateUntil = 0; this.lastAttackAt = -99; this.damageDone = false;
    this.orbitSign = Math.random() < 0.5 ? -1 : 1; this.isReady = true; this.heesHawveh = true; this.isDead = false;
    this.mesh = this.buildMesh(); this.mesh.position.copy(this.spawn); this.rig = this.mesh.userData.rigParts || {};
    this.navigator = getVillageGroundNavigator(olam); this.navigator.snap(this);
  }

  /** @returns {THREE.Group} Complete procedural animal body. */
  buildMesh() {
    const group = new THREE.Group(); group.name = this.name; group.nivraAwtsmoos = this;
    group.userData.isEnemy = true; group.userData.isVillageWildlife = true;
    const rig = createVillageAnimal(this.def, this); group.userData.rigParts = rig.userData.rigParts || {};
    group.add(rig);
    group.traverse(child => { child.nivraAwtsmoos = this; Object.assign(child.userData ||= {}, { isEnemy: true, isVillageWildlife: true, skipOctree: true, noOctree: true }); });
    return group;
  }

  /** @param {number} dt Delta seconds. */
  heesHawvoos(dt = 1 / 60) {
    if (this.isDead || !this.mesh) return;
    const delta = Math.min(0.075, n(dt, 1 / 60)); this.clock += delta;
    const player = this.olam?.player || this.olam?.chossid;
    const pos = playerPosition(player);
    if (!pos) return this.patrol(delta);
    const dist = this.mesh.position.distanceTo(pos);
    if (dist > this.aggroRange && this.stateName !== "patrol") this.setState("patrol");
    const handlers = { patrol: () => this.patrol(delta, pos, dist), chase: () => this.chase(delta, player, pos, dist), windup: () => this.windup(delta, player, pos), strike: () => this.strike(delta, player, pos), recover: () => this.recover(delta, pos) };
    (handlers[this.stateName] || handlers.patrol)();
    this.animateRig(delta, playerPosition(player));
    this.writeDebug(player);
  }

  setState(name, seconds = 0) { this.stateName = name; this.stateUntil = nowSeconds() + seconds; this.damageDone = false; this.mesh.userData.animalState = name; }
  readyToAttack() { return nowSeconds() - this.lastAttackAt >= this.attackCooldown; }
  face(point) { if (!point || !this.mesh) return; scratch.copy(point).sub(this.mesh.position); scratch.y = 0; if (scratch.lengthSq() > 0.0001) this.mesh.rotation.y = Math.atan2(scratch.x, scratch.z) + Math.PI; }

  patrol(dt, playerPos = null, dist = Infinity) {
    if (playerPos && dist < this.aggroRange) return this.setState("chase");
    this.navigator.move(this, this.patrolTarget(), dt, 0.42, 0);
  }
  chase(dt, player, pos, dist) {
    if (dist <= this.windupRange && this.readyToAttack()) return this.beginWindup(pos);
    this.navigator.move(this, pos, dt, 1.22, this.chaseStopDistance);
    const fresh = distanceToPlayer(this, player);
    if (fresh <= this.windupRange && this.readyToAttack()) this.beginWindup(playerPosition(player));
  }
  beginWindup(pos) { this.windupTarget = pos?.clone?.() || null; this.flash(this.attackData.color, 180); this.spawnWarningRing(); this.setState("windup", this.attackData.windup); }
  windup(dt, player, pos) { this.face(pos || this.windupTarget); if (nowSeconds() >= this.stateUntil) this.setState("strike", this.attackData.strike); }
  strike(dt, player, pos) {
    if (pos) { this.face(pos); this.navigator.move(this, pos, dt, this.attackData.lungeSpeed / Math.max(0.1, this.speed), 0.72); }
    if (!this.damageDone && distanceToPlayer(this, player) <= this.hitRange + 0.35) this.dealHit(player);
    if (nowSeconds() >= this.stateUntil) { this.lastAttackAt = nowSeconds(); this.setState("recover", this.attackData.recover); }
  }
  recover(dt, pos) {
    if (pos) { away.copy(this.mesh.position).sub(pos); away.y = 0; if (away.lengthSq() < 0.01) away.set(1, 0, 0); away.normalize(); scratch.copy(this.mesh.position).addScaledVector(away, 3.2); this.navigator.move(this, scratch, dt, 0.9, 0); }
    if (nowSeconds() >= this.stateUntil) this.setState("chase");
  }

  patrolTarget() {
    if (this.mesh.position.distanceTo(this.target) < 1.1) {
      const r = n(this.def.patrol, 8);
      this.target.set(this.spawn.x + (Math.random() - 0.5) * r * 2, this.spawn.y, this.spawn.z + (Math.random() - 0.5) * r * 2);
    }
    return this.target;
  }
  dealHit(player) {
    this.damageDone = true; const dealt = safeDamage(player, this.damage, this.olam);
    this.spawnHitArc(playerPosition(player)); this.flash("#fff6b0", 120);
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: `${this.name} ${this.attackData.name}: -${Math.round(dealt || this.damage)} HP`, color: this.attackData.color });
  }

  spawnWarningRing() {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(this.hitRange * 0.42, 0.025, 6, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(this.attackData.color), transparent: true, opacity: 0.75 }));
    ring.name = `${this.name}_windup_warning_ring`; ring.rotation.x = Math.PI / 2; ring.position.copy(this.mesh.position); ring.position.y += 0.08; this.olam?.scene?.add?.(ring);
    setTimeout(() => { ring.material?.dispose?.(); ring.geometry?.dispose?.(); ring.removeFromParent?.(); }, 190);
  }
  spawnHitArc(pos) {
    if (!pos) return;
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.045, 6, 24, Math.PI * 1.25), new THREE.MeshBasicMaterial({ color: new THREE.Color(this.attackData.color), transparent: true, opacity: 0.95 }));
    arc.name = `${this.name}_hit_arc`; arc.position.copy(pos); arc.position.y += 1.05; arc.rotation.set(Math.PI / 2, 0, this.clock); this.olam?.scene?.add?.(arc);
    setTimeout(() => { arc.material?.dispose?.(); arc.geometry?.dispose?.(); arc.removeFromParent?.(); }, 150);
  }

  animateRig(dt, targetPos) {
    const base = this.stateName === "strike" ? 1.13 : this.stateName === "windup" ? 0.96 : 1 + Math.sin(this.clock * 5.1) * 0.018;
    this.mesh.scale.setScalar(base);
    const head = this.rig.headRoot; if (head) head.rotation.x = this.stateName === "windup" ? -0.34 : this.stateName === "strike" ? 0.24 : Math.sin(this.clock * 2.2) * 0.06;
    const tail = this.rig.tailRoot; if (tail) tail.rotation.y = Math.sin(this.clock * (this.stateName === "chase" ? 7.5 : 3.5)) * 0.25;
    (this.rig.legs || []).forEach((leg, i) => { leg.rotation.x = Math.sin(this.clock * 9 + i * 1.7) * (this.stateName === "patrol" ? 0.08 : 0.18); });
    if (targetPos && (this.stateName === "windup" || this.stateName === "strike")) this.face(targetPos);
  }
  writeDebug(player) { this.mesh.userData.__debugAnimalState = { state: this.stateName, distance: Number(distanceToPlayer(this, player).toFixed(2)), ready: this.readyToAttack(), hitRange: this.hitRange, windupRange: this.windupRange }; }

  takeDamage(amount) { if (this.isDead) return; this.hp = Math.max(0, this.hp - n(amount, 0)); this.flash("#fff1a8", 120); if (this.hp <= 0) this.die(); }
  flash(color, ms = 120) { setEmissive(this.mesh, color); setTimeout(() => clearEmissive(this.mesh), ms); }
  die() {
    this.isDead = true; this.state?.recordKill?.(this); this.olam?.combatManager?.unregisterEnemy?.(this);
    this.mesh.traverse(child => { if (child.material) child.material.transparent = true; });
    const shrink = () => { if (!this.mesh) return; this.mesh.scale.multiplyScalar(0.84); if (this.mesh.scale.x > 0.06) requestAnimationFrame(shrink); else this.dispose(); };
    requestAnimationFrame(shrink);
  }
  dispose() { disposeVillageAnimal(this.mesh); this.mesh = null; }
}
