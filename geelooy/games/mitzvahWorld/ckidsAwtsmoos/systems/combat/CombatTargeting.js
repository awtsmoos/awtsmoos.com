// B"H
/**
 * @file CombatTargeting.js
 * @description Chapter 718: every animal receives its own raycast vessel.
 * Selection bubbles and mesh leaves are gathered per target, deduped, and then
 * offered to the pointer so the right creature rises into the target UI.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { ensureCreatureLevel } from "../progression/CreatureLevelRuntime.js";
import { logEightStep } from "../debug/ViralGameplayLog.js";
import { collectSafeRaycastLeaves } from "../../Olam/methods/helpers/mouse/RaycastSafety.js?v=reality-raycast-20260629-bh1";
import { combatTargetAllowed } from "./CombatTargetPolicy.js";
const DEFAULT_HP = Object.freeze({ fox:180, rabbit:95, deer:260, goat:240, frog:120, bird:150, target:100 });
const SELECT_RADIUS = Object.freeze({ frog:2.2, rabbit:2.15, bird:2.35, fox:2.55, deer:3.05, goat:2.75, ram:2.85, stag:3.05, wolf:2.75, target:2.35 });
function dataOf(o) { if (o && !o.userData) o.userData = {}; return o?.userData || {}; }
function rootOf(o) { let n = o; while (n) { const d = dataOf(n); if (d.combatTargetOwner) return d.combatTargetOwner.mesh || d.combatTargetOwner; if (d.proceduralSkinnedAnimal || d.wildlifeActor || d.selectableCombatTarget || d.combatTargetProxy || d.isEnemy) return n; n = n.parent; } return o; }
function speciesOf(o) { const d = dataOf(o); return d.species || d.motion?.species || d.profile?.species || o?.def?.species || "target"; }
function nameOf(o) { const d = dataOf(o), s = speciesOf(o); return d.targetName || d.displayName || o?.name || `Wild ${s}`; }
function bubbleRadius(species) { return SELECT_RADIUS[species] || SELECT_RADIUS.target; }
function combatAllowed(root) { return combatTargetAllowed(dataOf(root), speciesOf(root)); }
function healthOf(o) {
  const d = dataOf(o); if (d.health) return d.health;
  if (d.combatHp === undefined) { const hp = DEFAULT_HP[speciesOf(o)] || DEFAULT_HP.target; d.combatHp = hp; d.combatMaxHp = hp; }
  return { get current() { return d.combatHp || 0; }, set current(v) { d.combatHp = Math.max(0, Number(v) || 0); }, get max() { return d.combatMaxHp || 1; }, set max(v) { d.combatMaxHp = Math.max(1, Number(v) || 1); } };
}
function markChildren(root, wrapper) {
  root?.traverse?.(child => { const d = dataOf(child); d.combatTargetOwner = wrapper; d.selectableCombatTarget = true; if (!/soft_shadow/i.test(child.name || "")) d.skipRaycast = false; });
}
function ensureSelectionBubble(root, species) {
  const d = dataOf(root); if (d.selectionBubble) return d.selectionBubble;
  const bubble = new THREE.Mesh(new THREE.SphereGeometry(bubbleRadius(species), 10, 8), new THREE.MeshBasicMaterial({ transparent:true, opacity:0, depthWrite:false }));
  bubble.name = `${root.name || species}_selection_bubble`; bubble.visible = false;
  bubble.userData = { combatTargetProxy:true, selectableCombatTarget:true, species, interactionLayer:"combat-target", skipOctree:true, noOctree:true, skipRaycast:false };
  root.add(bubble); d.selectionBubble = bubble; return bubble;
}
export function isLootableTarget(t) { const data = dataOf(t?.mesh); return Boolean(t && t.mesh && t.mesh.visible !== false && (data.lootable || data.corpse || data.carcassEnabled && data.dead)); }
export function isLiveTarget(t) { const h = t?.health || healthOf(t?.mesh), data = dataOf(t?.mesh); return Boolean(t && t.mesh && t.mesh.visible !== false && (!t.isDead && !data.dead && Number(h?.current ?? t.hp ?? 1) > 0 || isLootableTarget(t))); }
export function makeCombatTarget(object, playerLevel = 1) {
  const root = rootOf(object); if (!root?.isObject3D || !combatAllowed(root)) return null;
  const d = dataOf(root); if (d.combatTargetWrapper) { ensureCreatureLevel(d.combatTargetWrapper, playerLevel); return d.combatTargetWrapper; }
  const h = healthOf(root), species = speciesOf(root);
  const wrapper = { mesh:root, isReady:true, get name() { return nameOf(root); }, get hp() { return Number(h.current ?? 0); }, get maxHp() { return Number(h.max ?? 1); }, get health() { return h; }, get isDead() { const rd = dataOf(root); return !isLootableTarget({ mesh:root }) && (Number(h.current ?? 0) <= 0 || root.visible === false || rd.dead === true); }, get lootable() { return isLootableTarget({ mesh:root }); }, def:{ species, color:species === "fox" ? 0xd46a24 : 0x8bcf68 }, takeDamage(amount = 0, source = {}) { if (isLootableTarget({ mesh:root })) return 0; if (typeof root.takeDamage === "function") return root.takeDamage(amount, source); h.current = Math.max(0, Number(h.current || 0) - Math.max(0, Number(amount) || 0)); dataOf(root).lastDamageAt = Date.now(); if (h.current <= 0) { dataOf(root).dead = true; dataOf(root).lootable = true; root.rotation.z = Math.PI / 2; } return amount; } };
  d.combatTargetWrapper = wrapper; d.combatTargetOwner = wrapper; d.selectableCombatTarget = true;
  const bubble = ensureSelectionBubble(root, species); bubble.userData.combatTargetOwner = wrapper;
  markChildren(root, wrapper); ensureCreatureLevel(wrapper, playerLevel); return wrapper;
}
function traverse(root, fn) { root?.traverse?.(fn); }
export function collectCombatTargets(olam, enemies = []) {
  const out = [], level = Number((olam?.player || olam?.chossid)?.level || 1);
  for (const e of enemies || []) { ensureCreatureLevel(e, level); if (isLiveTarget(e) && !out.includes(e)) out.push(e); }
  for (const root of [olam?.scene, olam?.__livingRegionWildlifeRoot, olam?.nivrayimGroup].filter(Boolean)) traverse(root, o => { const t = makeCombatTarget(o, level); if (isLiveTarget(t) && !out.includes(t)) out.push(t); });
  return out;
}
function addLeavesForTarget(out, seen, target) {
  if (!isLiveTarget(target)) return;
  const species = target.def?.species || speciesOf(target.mesh) || "target", bubble = dataOf(target.mesh).selectionBubble || ensureSelectionBubble(target.mesh, species);
  for (const leaf of [...collectSafeRaycastLeaves(bubble, "combat", false), ...collectSafeRaycastLeaves(target.mesh, "combat", true)]) {
    if (!leaf || seen.has(leaf)) continue; seen.add(leaf); out.push(leaf);
  }
}
export default class CombatTargeting {
  constructor(olam, onChange) { this.olam = olam; this.onChange = onChange; this.selected = null; this.raycaster = new THREE.Raycaster(); this.lastPointer = new THREE.Vector2(); this.marker = this.createMarker(); }
  createMarker() { const ring = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.65, 48), new THREE.MeshBasicMaterial({ color:0xffd95a, side:THREE.DoubleSide, transparent:true, opacity:.92, depthWrite:false })); ring.rotation.x = -Math.PI / 2; ring.visible = false; ring.userData.skipOctree = true; ring.userData.skipRaycast = true; this.olam?.scene?.add?.(ring); return ring; }
  pointer() { const p = this.olam?.pointer || this.olam?.mouse || this.olam?.ayin?.pointer; return p && Number.isFinite(p.x) && Number.isFinite(p.y) ? p : this.lastPointer.set(0, 0); }
  selectableObjects(candidates) { const objects = [], seen = new Set(); for (const t of candidates) addLeavesForTarget(objects, seen, t); this.olam.__combatRaycastTargetCount = objects.length; return objects; }
  selectFromPointer() { const camera = this.olam?.camera || this.olam?.activeCamera || this.olam?.ayin?.camera; if (!camera) { logEightStep(this.olam, 3, "targeting", "pointer-no-camera"); return "none"; } const candidates = collectCombatTargets(this.olam, this.olam?.combatManager?.enemies || []); this.raycaster.setFromCamera(this.pointer(), camera); const hit = this.raycaster.intersectObjects(this.selectableObjects(candidates), true)[0]; const target = hit ? this.findTarget(hit.object, candidates) : this.nearestProjectedTarget(this.pointer(), camera, candidates); if (!target) return "none"; if (target === this.selected) return "confirmed"; this.set(target); return "selected"; }
  nearestProjectedTarget(pointer, camera, candidates) { const pos = new THREE.Vector3(); let best = null, score = Infinity; for (const target of candidates.filter(isLiveTarget)) { target.mesh.getWorldPosition(pos); const pr = pos.clone().project(camera), d = Math.hypot(pr.x - pointer.x, pr.y - pointer.y), allowance = target.def?.species === "bird" ? .46 : .42; if (pr.z >= -1 && pr.z <= 1 && d < allowance && d < score) { best = target; score = d; } } return best; }
  nearestInRange(origin, forward, candidates, range = 50, cone = -1) { let best = null, score = Infinity; for (const t of candidates.filter(isLiveTarget)) { const v = t.mesh.position.clone().sub(origin), dist = v.length(); if (dist > range) continue; const dot = forward ? forward.dot(v.clone().setY(0).normalize()) : 1; if (dot < cone) continue; const s = dist - dot * 4; if (s < score) { score = s; best = t; } } return best; }
  findTarget(object, targets) { let n = object; while (n) { const owner = dataOf(n).combatTargetOwner; if (isLiveTarget(owner)) return owner; const direct = makeCombatTarget(n, Number((this.olam?.player || this.olam?.chossid)?.level || 1)); if (isLiveTarget(direct)) return direct; const found = targets.find(t => t?.mesh === n || t?.mesh === n.parent || t === n.nivraAwtsmoos); if (isLiveTarget(found)) return found; n = n.parent; } return null; }
  set(target) { this.selected = isLiveTarget(target) ? target : null; this.marker.visible = Boolean(this.selected?.mesh); logEightStep(this.olam, 3, "targeting", this.selected ? "selected" : "cleared", { target:nameOf(this.selected), live:Boolean(this.selected) }); this.onChange?.(this.selected); }
  update() { if (!isLiveTarget(this.selected)) return this.set(null); const p = this.selected.mesh.position; this.marker.position.set(p.x, p.y + .1, p.z); this.marker.rotation.z += .016; }
  dispose() { this.marker.removeFromParent(); this.marker.geometry.dispose(); this.marker.material.dispose(); }
}
