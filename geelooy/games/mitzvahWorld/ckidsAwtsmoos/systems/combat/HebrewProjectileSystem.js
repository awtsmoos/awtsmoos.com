// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import { getRandomLetter, getLetterByIndex } from './WeaponRegistry.js';

/**
 * @file HebrewProjectileSystem.js
 * @description Chapter 90: the projectile vessel no longer whispers a phantom
 * `Olam/olamDynamic.js` path inside JSDoc. The Awtsmoos keeps the import graph
 * pure for mobile Chrome and for every seer that follows string paths.
 */
function makeCanvas(width, height) {
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height);
  return null;
}

function makeLetterSprite(letter, color, size) {
  const canvas = makeCanvas(128, 128);
  if (!canvas) return makeFallbackMesh(letter, color, size);
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return makeFallbackMesh(letter, color, size);
  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ffe680';
  ctx.shadowBlur = 18;
  ctx.font = 'bold 96px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, color: new THREE.Color(color), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(size, size, size);
  return sprite;
}

function makeFallbackMesh(letter, color, size) {
  const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size * 0.3, size * 0.3, size * 0.3), material);
  mesh.userData.letter = letter;
  return mesh;
}

export default class HebrewProjectileSystem {
  /** @param {object} olam Runtime world vessel. */
  constructor(olam) {
    this.olam = olam;
    this.projectiles = [];
    this.projectileGroup = new THREE.Group();
    this.projectileGroup.name = 'HebrewProjectiles';
    if (olam.scene) olam.scene.add(this.projectileGroup);
  }

  /** @param {object} weaponDef Weapon definition. @param {THREE.Vector3} origin Origin. @param {THREE.Vector3} direction Direction. @returns {void} */
  fire(weaponDef, origin, direction) {
    if (!weaponDef?.projectile) return;
    const proj = weaponDef.projectile;
    const burstCount = proj.burst || 1;
    for (let i = 0; i < burstCount; i += 1) this.spawnProjectile(weaponDef, proj, burstCount, i, origin, direction);
  }

  spawnProjectile(weaponDef, proj, burstCount, index, origin, direction) {
    const letter = proj.letter === 'ALL' ? getLetterByIndex(index) : (burstCount > 1 ? getRandomLetter() : proj.letter);
    const mesh = makeLetterSprite(letter, proj.color, proj.size);
    mesh.position.copy(origin);
    const dir = this.spreadDirection(direction, proj.spread || 0);
    this.projectileGroup.add(mesh);
    this.projectiles.push({ mesh, velocity: dir.multiplyScalar(proj.speed), damage: weaponDef.damage, lifetime: proj.lifetime, age: 0, letter });
  }

  spreadDirection(direction, spread) {
    const dir = direction.clone();
    if (spread <= 0) return dir;
    const axis = new THREE.Vector3(0, 1, 0);
    dir.applyAxisAngle(axis, (Math.random() - 0.5) * spread);
    const horizAxis = new THREE.Vector3().crossVectors(dir, axis).normalize();
    if (horizAxis.length() > 0.01) dir.applyAxisAngle(horizAxis, (Math.random() - 0.5) * spread * 0.3);
    return dir;
  }

  /** @param {number} dt Delta seconds. @param {Array<object>} enemies Enemies. @returns {void} */
  update(dt, enemies = []) {
    const toRemove = [];
    for (let i = 0; i < this.projectiles.length; i += 1) {
      const p = this.projectiles[i];
      p.age += dt;
      if (p.age >= p.lifetime) { toRemove.push(i); continue; }
      p.mesh.position.add(p.velocity.clone().multiplyScalar(dt));
      this.fadeProjectile(p);
      if (this.hitAnyEnemy(p, enemies)) toRemove.push(i);
    }
    for (let i = toRemove.length - 1; i >= 0; i -= 1) this.removeAt(toRemove[i]);
  }

  fadeProjectile(p) {
    const ratio = p.age / p.lifetime;
    if (p.mesh.material) p.mesh.material.opacity = Math.max(0, 1 - ratio * ratio);
    const pulse = 1 + Math.sin(p.age * 15) * 0.2;
    const last = p.mesh.userData.lastPulse || 1;
    p.mesh.scale.multiplyScalar(pulse / last);
    p.mesh.userData.lastPulse = pulse;
  }

  hitAnyEnemy(p, enemies) {
    for (const enemy of enemies) {
      if (!enemy?.mesh || !enemy.isReady || enemy.hp <= 0) continue;
      if (p.mesh.position.distanceTo(enemy.mesh.position) >= 2) continue;
      enemy.takeDamage?.(p.damage);
      this.spawnHitEffect(p.mesh.position.clone(), p.letter);
      return true;
    }
    return false;
  }

  spawnHitEffect(position, letter) {
    const mesh = makeLetterSprite(letter, '#ffff00', 1.5);
    mesh.position.copy(position);
    this.projectileGroup.add(mesh);
    let age = 0;
    const flashUpdate = () => {
      age += 0.016;
      mesh.scale.multiplyScalar(1.05);
      if (mesh.material) mesh.material.opacity = Math.max(0, 1 - age * 4);
      if (age > 0.3) this.disposeMesh(mesh);
      else if (typeof requestAnimationFrame === 'function') requestAnimationFrame(flashUpdate);
    };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(flashUpdate);
  }

  removeAt(index) {
    const p = this.projectiles[index];
    if (p?.mesh) this.disposeMesh(p.mesh);
    this.projectiles.splice(index, 1);
  }

  disposeMesh(mesh) {
    this.projectileGroup.remove(mesh);
    mesh.material?.map?.dispose?.();
    mesh.material?.dispose?.();
    mesh.geometry?.dispose?.();
  }

  dispose() {
    for (const p of this.projectiles) if (p.mesh) this.disposeMesh(p.mesh);
    this.projectiles = [];
  }
}
