// B"H
/**
 * @file CombatTargeting.js
 * @description
 * Chapter 708: mobile taps become real target selection, not just glow.
 * The Awtsmoos gathers mazikim and runtime wildlife into one target covenant;
 * first tap selects, second tap confirms, and every selected fox receives a ring.
 */
import * as THREE from "/games/scripts/build/three.module.js";
const DEFAULT_HP = { fox: 45, rabbit: 12, deer: 35, goat: 28, frog: 8, bird: 6 };
function live(candidate) { return candidate?.mesh && !candidate.isDead && Number(candidate.hp ?? 1) > 0; }
function speciesOf(group) { return group?.userData?.species || group?.userData?.motion?.species || "target"; }
function nameOf(group) { const s = speciesOf(group); return group?.name || `wild_${s}`; }
function ensureWildlifeTarget(group) {
  if (!group?.isObject3D || !group.userData?.wildlifeActor) return null;
  if (!group.userData.combatTarget) {
    const species = speciesOf(group), hp = DEFAULT_HP[species] || 20;
    group.userData.combatHp = group.userData.combatHp ?? hp;
    group.userData.combatMaxHp = group.userData.combatMaxHp ?? hp;
    group.userData.combatTarget = {
      mesh: group, isReady: true, name: nameOf(group), def: { species, color: species === "fox" ? 0xd46a24 : 0x8bcf68 },
      get hp() { return group.userData.combatHp || 0; }, get maxHp() { return group.userData.combatMaxHp || hp; },
      get isDead() { return group.userData.combatHp <= 0 || !group.visible; },
      takeDamage(amount = 0) {
        group.userData.combatHp = Math.max(0, Number(group.userData.combatHp || hp) - Math.max(0, Number(amount) || 0));
        group.userData.lastDamageAt = Date.now();
        group.scale.setScalar(group.userData.combatHp <= 0 ? 0.001 : 1);
        if (group.userData.combatHp <= 0) { group.visible = false; group.userData.refined = true; }
      }
    };
  }
  return group.userData.combatTarget;
}
export function collectCombatTargets(olam, enemies = []) {
  const out = enemies.filter(live);
  const root = olam?.__livingRegionWildlifeRoot;
  root?.children?.forEach(child => { const t = ensureWildlifeTarget(child); if (live(t) && !out.includes(t)) out.push(t); });
  return out;
}
export default class CombatTargeting {
  constructor(olam, onChange) { this.olam = olam; this.onChange = onChange; this.selected = null; this.raycaster = new THREE.Raycaster(); this.marker = this.createMarker(); }
  createMarker() { const g = new THREE.RingGeometry(1.25, 1.65, 48), m = new THREE.MeshBasicMaterial({ color: 0xffd95a, side: THREE.DoubleSide, transparent: true, opacity: .92, depthWrite: false }); const ring = new THREE.Mesh(g, m); ring.rotation.x = -Math.PI / 2; ring.visible = false; ring.userData.skipOctree = true; this.olam?.scene?.add?.(ring); return ring; }
  selectFromPointer(enemies = []) {
    const camera = this.olam?.camera || this.olam?.activeCamera, pointer = this.olam?.pointer; if (!camera || !pointer) return "none";
    const candidates = collectCombatTargets(this.olam, enemies), roots = candidates.filter(live).map(t => t.mesh);
    this.raycaster.setFromCamera(pointer, camera);
    const hit = this.raycaster.intersectObjects(roots, true)[0], target = hit ? this.findTarget(hit.object, candidates) : null;
    if (!target) return "none"; if (target === this.selected) return "confirmed"; this.set(target); return "selected";
  }
  findTarget(object, targets) { let n = object; while (n) { const direct = ensureWildlifeTarget(n); if (direct) return direct; const found = targets.find(t => t === n.nivraAwtsmoos || t?.mesh === n); if (found) return found; n = n.parent; } return null; }
  set(target) { this.selected = live(target) ? target : null; this.marker.visible = Boolean(this.selected?.mesh); this.onChange?.(this.selected); }
  update() { if (!live(this.selected)) return this.set(null); const p = this.selected.mesh.position; this.marker.position.set(p.x, p.y + .1, p.z); this.marker.rotation.z += .016; }
  dispose() { this.marker.removeFromParent(); this.marker.geometry.dispose(); this.marker.material.dispose(); }
}
