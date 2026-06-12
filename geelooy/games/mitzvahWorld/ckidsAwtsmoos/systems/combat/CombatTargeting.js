// B"H
/**
 * @file CombatTargeting.js
 * @description
 * Chapter 707: A click becomes Daas, deliberate connection. The Awtsmoos
 * recreates pointer, ray, creature, and glowing ring in one present instant;
 * the first click names the opponent, and the second confirms the strike.
 */
import * as THREE from "/games/scripts/build/three.module.js";

/** Owns click selection and its visible ground-ring covenant. */
export default class CombatTargeting {
  /** @param {object} olam World vessel. @param {(target: object|null) => void} onChange Selection callback. */
  constructor(olam, onChange) {
    this.olam = olam;
    this.onChange = onChange;
    this.selected = null;
    this.raycaster = new THREE.Raycaster();
    this.marker = this.createMarker();
  }

  /** @returns {THREE.Mesh} A luminous ring placed beneath the chosen creature. */
  createMarker() {
    const geometry = new THREE.RingGeometry(1.25, 1.55, 40);
    const material = new THREE.MeshBasicMaterial({ color: 0xffd95a, side: THREE.DoubleSide, transparent: true, opacity: 0.86, depthWrite: false });
    const marker = new THREE.Mesh(geometry, material);
    marker.rotation.x = -Math.PI / 2;
    marker.position.y = 0.08;
    marker.visible = false;
    marker.userData.skipOctree = true;
    this.olam?.scene?.add?.(marker);
    return marker;
  }

  /** @param {object[]} enemies Living target candidates. @returns {"none"|"selected"|"confirmed"} Click result. */
  selectFromPointer(enemies = []) {
    const camera = this.olam?.camera || this.olam?.activeCamera;
    const pointer = this.olam?.pointer;
    if (!camera || !pointer) return "none";
    const roots = enemies.filter(enemy => enemy?.mesh && !enemy.isDead && enemy.hp > 0).map(enemy => enemy.mesh);
    this.raycaster.setFromCamera(pointer, camera);
    const hit = this.raycaster.intersectObjects(roots, true)[0];
    const target = hit ? this.findEnemy(hit.object, enemies) : null;
    if (!target) return "none";
    if (target === this.selected) return "confirmed";
    this.set(target);
    return "selected";
  }

  /** @param {THREE.Object3D} object Hit object. @param {object[]} enemies Candidates. @returns {object|null} Runtime enemy. */
  findEnemy(object, enemies) {
    let node = object;
    while (node) {
      const enemy = enemies.find(candidate => candidate === node.nivraAwtsmoos || candidate?.mesh === node);
      if (enemy) return enemy;
      node = node.parent;
    }
    return null;
  }

  /** @param {object|null} target New target. */
  set(target) {
    this.selected = target || null;
    this.marker.visible = Boolean(target?.mesh);
    this.onChange?.(this.selected);
  }

  /** Keeps the ring beneath the selected target. */
  update() {
    if (!this.selected?.mesh || this.selected.isDead || this.selected.hp <= 0) return this.set(null);
    this.marker.position.set(this.selected.mesh.position.x, this.selected.mesh.position.y + 0.08, this.selected.mesh.position.z);
    this.marker.rotation.z += 0.012;
  }

  /** Releases GPU resources. */
  dispose() {
    this.marker.removeFromParent();
    this.marker.geometry.dispose();
    this.marker.material.dispose();
  }
}
