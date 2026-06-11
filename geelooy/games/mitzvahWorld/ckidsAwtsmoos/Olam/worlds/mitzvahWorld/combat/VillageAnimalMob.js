// B"H
/**
 * @file VillageAnimalMob.js
 * @description
 * Chapter 702: The meadow learns to answer the player's attack.
 *
 * Each animal is a complete small soul of gameplay: procedural body, patrol
 * intent, aggro, melee, health, death, and reward. The Awtsmoos animates the
 * spark through pure data so the village becomes a playable camp, not scenery.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const scratch = new THREE.Vector3();
const up = new THREE.Vector3(0, 1, 0);
const BODY_GEO = new THREE.SphereGeometry(1, 14, 10);
const BOX_GEO = new THREE.BoxGeometry(1, 1, 1);

function v3(p = {}) { return new THREE.Vector3(Number(p.x) || 0, Number(p.y) || 0, Number(p.z) || 0); }
function n(value, fallback) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
function mat(color, emissive = 0x000000) { return new THREE.MeshLambertMaterial({ color, emissive, emissiveIntensity: 0.08 }); }
function pulseScale(t, base = 1) { return base + Math.sin(t * 4.4) * 0.035; }

export default class VillageAnimalMob {
  /** @param {object} olam World. @param {object} def Authored mob definition. @param {object} state Shared quest state. */
  constructor(olam, def, state) {
    this.olam = olam;
    this.def = def;
    this.state = state;
    this.id = def.id;
    this.name = def.name;
    this.type = "mazik";
    this.elementalType = "wildAnimal";
    this.hp = n(def.hp, 60);
    this.maxHp = this.hp;
    this.damage = n(def.damage, 8);
    this.xpValue = n(def.xp, 25);
    this.perutas = n(def.perutas, 3);
    this.speed = n(def.speed, 3.4);
    this.aggroRange = n(def.aggro, 18);
    this.attackRange = 2.15;
    this.attackCooldown = 1.25;
    this.lastAttackAt = 0;
    this.spawn = v3(def.position);
    this.target = this.spawn.clone();
    this.clock = Math.random() * 100;
    this.isReady = true;
    this.heesHawveh = true;
    this.isDead = false;
    this.mesh = this.buildMesh();
    this.mesh.position.copy(this.spawn);
  }

  /** @returns {THREE.Group} Complete procedural animal body. */
  buildMesh() {
    const group = new THREE.Group();
    group.name = this.name;
    group.nivraAwtsmoos = this;
    group.userData.isEnemy = true;
    group.userData.isVillageWildlife = true;
    const body = new THREE.Mesh(BODY_GEO, mat(this.def.color, this.def.color));
    body.scale.set(this.def.species === "stag" ? 1.2 : 0.95, 0.58, 1.55);
    body.position.y = 0.58;
    const head = new THREE.Mesh(BODY_GEO, mat(this.def.color, this.def.accent));
    head.scale.set(0.48, 0.42, 0.48);
    head.position.set(0, 0.93, 1.18);
    group.add(body, head);
    this.addLegs(group);
    this.addSpeciesDetails(group);
    group.traverse(child => {
      child.castShadow = false;
      child.receiveShadow = true;
      child.nivraAwtsmoos = this;
      Object.assign(child.userData ||= {}, { isEnemy: true, isVillageWildlife: true, skipOctree: true, noOctree: true });
    });
    return group;
  }

  /** @param {THREE.Group} group Animal root. */
  addLegs(group) {
    const legMat = mat(this.def.color);
    [-0.42, 0.42].forEach(x => [-0.62, 0.62].forEach(z => {
      const leg = new THREE.Mesh(BOX_GEO, legMat);
      leg.scale.set(0.18, 0.72, 0.18);
      leg.position.set(x, 0.13, z);
      group.add(leg);
    }));
  }

  /** @param {THREE.Group} group Animal root. */
  addSpeciesDetails(group) {
    const accent = mat(this.def.accent, this.def.accent);
    const tail = new THREE.Mesh(BODY_GEO, accent);
    tail.scale.set(0.22, 0.22, this.def.species === "fox" ? 0.95 : 0.48);
    tail.position.set(0, 0.78, -1.35);
    tail.rotation.x = -0.75;
    group.add(tail);
    if (this.def.species === "ram" || this.def.species === "stag") this.addHorns(group, accent);
    else this.addEars(group, accent);
  }

  addHorns(group, accent) {
    [-0.22, 0.22].forEach(x => {
      const horn = new THREE.Mesh(BOX_GEO, accent);
      horn.scale.set(0.09, this.def.species === "stag" ? 0.82 : 0.48, 0.09);
      horn.position.set(x, 1.38, 1.22);
      horn.rotation.z = x < 0 ? 0.34 : -0.34;
      group.add(horn);
    });
  }

  addEars(group, accent) {
    [-0.22, 0.22].forEach(x => {
      const ear = new THREE.Mesh(BOX_GEO, accent);
      ear.scale.set(0.18, 0.42, 0.08);
      ear.position.set(x, 1.28, 1.13);
      ear.rotation.z = x < 0 ? 0.42 : -0.42;
      group.add(ear);
    });
  }

  /** @param {number} dt Delta seconds. */
  heesHawvoos(dt) {
    if (this.isDead || !this.mesh) return;
    this.clock += dt;
    const player = this.olam?.player || this.olam?.chossid;
    const playerPos = player?.mesh?.position;
    const dist = playerPos ? this.mesh.position.distanceTo(playerPos) : Infinity;
    if (dist < this.attackRange) this.attack(player);
    const goal = dist < this.aggroRange ? playerPos : this.patrolTarget();
    if (goal) this.moveToward(goal, dt, dist < this.aggroRange ? 1 : 0.42);
    this.mesh.scale.setScalar(pulseScale(this.clock));
  }

  /** @returns {THREE.Vector3} Current patrol point. */
  patrolTarget() {
    if (this.mesh.position.distanceTo(this.target) < 1.1) {
      const r = n(this.def.patrol, 8);
      this.target.set(this.spawn.x + (Math.random() - 0.5) * r * 2, this.spawn.y, this.spawn.z + (Math.random() - 0.5) * r * 2);
    }
    return this.target;
  }

  /** @param {THREE.Vector3} goal Target. @param {number} dt Delta. @param {number} speedScale Scale. */
  moveToward(goal, dt, speedScale) {
    scratch.copy(goal).sub(this.mesh.position);
    scratch.y = 0;
    if (scratch.lengthSq() < 0.01) return;
    scratch.normalize();
    this.mesh.position.addScaledVector(scratch, this.speed * speedScale * dt);
    this.mesh.quaternion.slerp(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), scratch), 0.16);
  }

  /** @param {object} player Runtime player. */
  attack(player) {
    const now = performance.now() / 1000;
    if (now - this.lastAttackAt < this.attackCooldown) return;
    this.lastAttackAt = now;
    this.mesh.position.addScaledVector(up, 0.24);
    player?.takeDamage?.(this.damage);
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: `-${this.damage} HP`, color: "#ff7b7b" });
  }

  /** @param {number} amount Incoming damage. */
  takeDamage(amount) {
    if (this.isDead) return;
    this.hp = Math.max(0, this.hp - n(amount, 0));
    this.flash();
    if (this.hp <= 0) this.die();
  }

  flash() {
    this.mesh.traverse(child => child.material?.emissive?.setHex?.(0xfff1a8));
    setTimeout(() => this.mesh?.traverse?.(child => child.material?.emissive?.setHex?.(0x000000)), 95);
  }

  /** Completes death, reward, and removal. */
  die() {
    this.isDead = true;
    this.state.recordKill(this);
    this.olam?.combatManager?.unregisterEnemy?.(this);
    this.mesh.traverse(child => { if (child.material) child.material.transparent = true; });
    const shrink = () => {
      if (!this.mesh) return;
      this.mesh.scale.multiplyScalar(0.84);
      if (this.mesh.scale.x > 0.06) requestAnimationFrame(shrink);
      else this.dispose();
    };
    requestAnimationFrame(shrink);
  }

  dispose() {
    this.mesh?.removeFromParent?.();
    this.mesh?.traverse?.(child => { child.geometry?.dispose?.(); child.material?.dispose?.(); });
    this.mesh = null;
  }
}
