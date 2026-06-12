// B"H
/**
 * @file VillageAnimalMob.js
 * @description
 * Chapter 703: the animal stops at the edge of the player's shadow.
 * The Awtsmoos creates nearness and separation from nothing every instant; this
 * mob honors both. It patrols, notices, approaches, circles at a sane radius,
 * shows a windup flash, lands a named attack, then retreats instead of melting
 * into the player like broken geometry.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { getVillageGroundNavigator } from "./VillageGroundNavigator.js";
import { createVillageAnimal, disposeVillageAnimal } from "./VillageAnimalFactory.js";

function v3(p = {}) { return new THREE.Vector3(Number(p.x) || 0, Number(p.y) || 0, Number(p.z) || 0); }
function n(value, fallback) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
function pulseScale(t, base = 1) { return base + Math.sin(t * 4.4) * 0.035; }

const ATTACKS = {
  fox: { name: "snap", color: "#ff9b45", range: 2.45, cooldown: 1.15, windup: 170 },
  wolf: { name: "lunge", color: "#d7e6ff", range: 2.75, cooldown: 1.35, windup: 220 },
  ram: { name: "bash", color: "#fff0a8", range: 3.0, cooldown: 1.55, windup: 260 },
  stag: { name: "antler sweep", color: "#c9ff9d", range: 3.15, cooldown: 1.7, windup: 280 }
};

export default class VillageAnimalMob {
  /** @param {object} olam World. @param {object} def Authored mob definition. @param {object} state Shared quest state. */
  constructor(olam, def, state) {
    this.olam = olam; this.def = def; this.state = state; this.id = def.id; this.name = def.name;
    this.type = "mazik"; this.elementalType = "wildAnimal";
    this.hp = n(def.hp, 60); this.maxHp = this.hp; this.damage = n(def.damage, 8);
    this.xpValue = n(def.xp, 25); this.perutas = n(def.perutas, 3); this.speed = n(def.speed, 3.4);
    this.groundLift = n(def.groundLift, 0.24); this.aggroRange = n(def.aggro, 18);
    this.attackData = ATTACKS[def.species] || ATTACKS.fox;
    this.attackRange = n(def.attackRange, this.attackData.range); this.preferredRange = n(def.preferredRange, this.attackRange + 0.9);
    this.attackCooldown = n(def.attackCooldown, this.attackData.cooldown); this.lastAttackAt = -99;
    this.spawn = v3(def.position); this.target = this.spawn.clone(); this.clock = Math.random() * 100;
    this.orbitSign = Math.random() < 0.5 ? -1 : 1; this.isReady = true; this.heesHawveh = true; this.isDead = false;
    this.mesh = this.buildMesh(); this.mesh.position.copy(this.spawn);
    this.navigator = getVillageGroundNavigator(olam); this.navigator.snap(this);
  }

  /** @returns {THREE.Group} Complete procedural animal body. */
  buildMesh() {
    const group = new THREE.Group(); group.name = this.name; group.nivraAwtsmoos = this;
    group.userData.isEnemy = true; group.userData.isVillageWildlife = true;
    group.add(createVillageAnimal(this.def, this));
    group.traverse(child => {
      child.castShadow = false; child.receiveShadow = true; child.nivraAwtsmoos = this;
      Object.assign(child.userData ||= {}, { isEnemy: true, isVillageWildlife: true, skipOctree: true, noOctree: true });
    });
    return group;
  }

  /** @param {number} dt Delta seconds. */
  heesHawvoos(dt) {
    if (this.isDead || !this.mesh) return;
    this.clock += Math.min(dt, 0.05);
    const player = this.olam?.player || this.olam?.chossid;
    const playerPos = player?.mesh?.position;
    const dist = playerPos ? this.mesh.position.distanceTo(playerPos) : Infinity;
    if (playerPos && dist < this.aggroRange) this.navigator.move(this, playerPos, dt, 1, this.preferredRange);
    else this.navigator.move(this, this.patrolTarget(), dt, 0.42, 0);
    if (player && dist <= this.attackRange) this.attack(player);
    const attackPulse = performance.now() < (this.attackPulseUntil || 0) ? 1.16 : 1;
    this.mesh.scale.setScalar(pulseScale(this.clock) * attackPulse);
  }

  /** @returns {THREE.Vector3} Current patrol point. */
  patrolTarget() {
    if (this.mesh.position.distanceTo(this.target) < 1.1) {
      const r = n(this.def.patrol, 8);
      this.target.set(this.spawn.x + (Math.random() - 0.5) * r * 2, this.spawn.y, this.spawn.z + (Math.random() - 0.5) * r * 2);
    }
    return this.target;
  }

  /** @param {object} player Runtime player. */
  attack(player) {
    const now = performance.now() / 1000;
    if (now - this.lastAttackAt < this.attackCooldown) return;
    this.lastAttackAt = now; this.attackPulseUntil = performance.now() + this.attackData.windup;
    this.flash(this.attackData.color);
    setTimeout(() => {
      if (this.isDead || !this.mesh || !player?.mesh) return;
      if (this.mesh.position.distanceTo(player.mesh.position) > this.attackRange + 0.7) return;
      player?.takeDamage?.(this.damage);
      this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: `${this.name} ${this.attackData.name}: -${this.damage} HP`, color: this.attackData.color });
    }, this.attackData.windup);
  }

  /** @param {number} amount Incoming damage. */
  takeDamage(amount) {
    if (this.isDead) return;
    this.hp = Math.max(0, this.hp - n(amount, 0)); this.flash("#fff1a8");
    if (this.hp <= 0) this.die();
  }

  /** @param {string} color CSS attack color. */
  flash(color) {
    const hex = new THREE.Color(color).getHex();
    this.mesh.traverse(child => child.material?.emissive?.setHex?.(hex));
    setTimeout(() => this.mesh?.traverse?.(child => child.material?.emissive?.setHex?.(0x000000)), 120);
  }

  /** Completes death, reward, and removal. */
  die() {
    this.isDead = true; this.state.recordKill(this); this.olam?.combatManager?.unregisterEnemy?.(this);
    this.mesh.traverse(child => { if (child.material) child.material.transparent = true; });
    const shrink = () => { if (!this.mesh) return; this.mesh.scale.multiplyScalar(0.84); if (this.mesh.scale.x > 0.06) requestAnimationFrame(shrink); else this.dispose(); };
    requestAnimationFrame(shrink);
  }

  dispose() { disposeVillageAnimal(this.mesh); this.mesh = null; }
}
