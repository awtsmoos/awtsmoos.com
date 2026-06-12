// B"H
/**
 * @file villageGrounding.js
 * @description
 * Chapter 572: floating things are judged by the same law as the hills.
 * The Awtsmoos no longer lets props guess the nearest old point. Terrain mesh,
 * terrain collider, grounding, mobs, houses, paths, and diagnostics all drink
 * from `TerrainMath.calculateHeightAt`, so levitation has one place to hide.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import TerrainMath from "../../../dvarim/terrain/core/TerrainMath.js";
import { diagEvent, diagThrottle } from "../../../utils/AwtsmoosDiagnostics.js";

const RAY = new THREE.Raycaster();
const DOWN = new THREE.Vector3(0, -1, 0);
const TYPES = new Set(["villagePictureProp", "villageTreeField", "villageGrassField", "interactiveNpc", "interactiveDoor", "villageHouseCollider", "villageFenceCollider", "villageRoadCollider", "chossid", "mazik"]);
const SKIP_NAMES = /sky|cloud|camera|light|ocean|water|helper|ray|ui|hud/i;
const DOORWAY = new THREE.Vector3(0, 0, 2.68);
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const isLiving = n => ["interactiveNpc", "chossid", "mazik"].includes(n?.type) || n?.mesh?.userData?.isVillageWildlife;
const authoredY = n => Boolean(n?.useAuthoredY || n?.options?.useAuthoredY || n?.mesh?.userData?.useAuthoredY || /Collider$/.test(n?.type || ""));
function isVillageWorld(olam, made = []) { const i = olam?.baseInfo || {}, id = String(i.id || i.shaym || i.title || "").toLowerCase(); return id.includes("village") || made.some(n => TYPES.has(n?.type)); }
function terrainMeshes(olam) { const out = []; for (const n of olam?.nivrayim || []) if (n?.type === "proceduralTerrain" && n.mesh) out.push(n.mesh); if (!out.length) olam?.scene?.traverse?.(o => { if (o?.userData?.isTerrain) out.push(o); }); return out; }
function terrainLawY(olam, x, z) { const law = olam?.awtsmoosTerrainLaw; if (!law?.data) return null; const lx = x - num(law.position?.x), lz = z - num(law.position?.z); return num(law.position?.y) + TerrainMath.calculateHeightAt(lx, lz, law.data); }
function rayGroundY(meshes, x, z) { if (!meshes.length) return 0; RAY.set(new THREE.Vector3(x, 260, z), DOWN); RAY.far = 620; return RAY.intersectObjects(meshes, true).filter(hit => !hit.object?.userData?.skipRaycast)[0]?.point?.y ?? 0; }
function groundAt(olam, meshes, x, z) { const lawY = terrainLawY(olam, x, z); return Number.isFinite(lawY) ? lawY : rayGroundY(meshes, x, z); }
function worldPoint(root) { const p = new THREE.Vector3(); root?.getWorldPosition?.(p); return p; }
function worldMinY(root) { root?.updateMatrixWorld?.(true); const box = new THREE.Box3().setFromObject(root); return !box.isEmpty() && Number.isFinite(box.min.y) ? box.min.y : null; }
function finiteObject(root) { let ok = Boolean(root?.isObject3D); root?.updateMatrixWorld?.(true); root?.traverse?.(child => { if (!child.isObject3D) return; const p = new THREE.Vector3(); child.getWorldPosition(p); if (![p.x, p.y, p.z].every(Number.isFinite)) ok = false; }); return ok; }
function liftOf(n) { return num(n?.options?.groundLift ?? n?.groundLift ?? n?.originalOptions?.groundLift, 0); }
function shouldSkipObject(o) { return !o?.isObject3D || o.isCamera || o.isLight || SKIP_NAMES.test(o.name || "") || o.userData?.skipVillageGrounding || o.userData?.isTerrain || o.userData?.renderlessHelper; }
function syncLiving(n, y) { const p = n.mesh?.position || n.modelMesh?.position || { x: 0, z: 0 }; if (typeof n.setPosition === "function") n.setPosition(new THREE.Vector3(num(p.x), y, num(p.z))); else if (n.mesh?.position) n.mesh.position.y = y; n.velocity?.set?.(0, 0, 0); Object.assign(n, { onFloor: true, isOnGround: true, grounded: true }); n._syncMesh?.(1 / 60); }
function allCandidates(olam, made) {
  const seen = new Set(), list = [];
  const add = n => { if (n && !seen.has(n)) { seen.add(n); list.push(n); } };
  for (const n of [...(made || []), ...(olam?.nivrayim || [])]) if (n && (TYPES.has(n.type) || n?.mesh?.userData?.villageDecor || n?.mesh?.userData?.isEnemy)) add(n);
  for (const n of [olam?.chossid, olam?.player]) add(n);
  olam?.scene?.children?.forEach(o => { if (shouldSkipObject(o)) return; if (o.userData?.villageCombatDecor || o.userData?.villageDecor || o.userData?.isVillageWildlife) add({ name: o.name, type: "sceneVillageObject", mesh: o }); });
  return list;
}
function visualByName(c, name) { return c.find(n => n?.mesh && n?.name === name); }
function firstKind(c, kind) { return c.find(n => n?.type === "villagePictureProp" && n.options?.kind === kind); }
function groundOne(olam, meshes, n) {
  const root = n?.mesh || n?.modelMesh; if (!root?.isObject3D) return null;
  if (authoredY(n) && !isLiving(n)) return { name: n.name, type: n.type, authoredY: root.position.y, moved: false };
  const p = worldPoint(root), y = groundAt(olam, meshes, p.x, p.z) + liftOf(n);
  if (isLiving(n)) { syncLiving(n, y); return { name: n.name, type: n.type, groundY: y, moved: true }; }
  const minY = worldMinY(root); if (minY === null) return null;
  const delta = y - minY; if (Math.abs(delta) > 0.0001) root.position.y += delta; root.updateMatrixWorld(true);
  return { name: n.name, type: n.type, groundY: y, minY, delta, moved: Math.abs(delta) > 0.0001 };
}
function alignDoor(c) { const door = c.find(n => n?.type === "interactiveDoor" && n.mesh), house = visualByName(c, door?.options?.targetName) || firstKind(c, "gableHouse"); if (!door || !house?.mesh) return null; if (door.alignToHouseTransform?.(house.mesh)) return { name: door.name, type: door.type, targetName: house.name, method: "contract", moved: true }; const p = DOORWAY.clone(); house.mesh.localToWorld(p); door.mesh.position.copy(p); door.mesh.rotation.y = house.mesh.rotation.y; door.mesh.updateMatrixWorld(true); return { name: door.name, type: door.type, targetName: house.name, method: "fallback", moved: true }; }
function colliderReady(collider, visual) { return Boolean(collider?.mesh && finiteObject(collider.mesh) && (!visual?.mesh || finiteObject(visual.mesh))); }
function bakeFinalColliders(olam, c) { const out = []; for (const collider of c.filter(n => n?.type === "villageHouseCollider" && n.mesh)) { const visual = visualByName(c, collider.options?.targetName) || firstKind(c, "gableHouse"); const ready = colliderReady(collider, visual); const aligned = ready && visual?.mesh ? collider.alignToFinalHouseTransform?.(visual.mesh) || false : false; out.push({ name: collider.name, type: collider.type, targetName: visual?.name, ready, aligned, octreeMeshesAdded: aligned ? collider.addFinalCollidersToOctree?.(olam) || 0 : 0 }); } for (const collider of c.filter(n => n?.type === "villageFenceCollider" && n.mesh)) { const ready = colliderReady(collider); out.push({ name: collider.name, type: collider.type, ready, octreeMeshesAdded: ready ? collider.addFinalCollidersToOctree?.(olam) || 0 : 0 }); } for (const collider of c.filter(n => n?.type === "villageRoadCollider" && n.mesh)) { const visual = visualByName(c, collider.targetName || collider.options?.targetName) || firstKind(c, "pictureDirtPath"); const ready = colliderReady(collider, visual); const aligned = ready && visual?.mesh ? collider.alignToFinalRoadTransform?.(visual.mesh) || false : false; out.push({ name: collider.name, type: collider.type, targetName: visual?.name, ready, aligned, octreeMeshesAdded: aligned ? collider.addFinalCollidersToOctree?.(olam) || 0 : 0 }); } return out; }
function settleVisuals(olam, made) { const meshes = terrainMeshes(olam), candidates = allCandidates(olam, made), report = candidates.map(n => groundOne(olam, meshes, n)).filter(Boolean); const door = alignDoor(candidates); if (door) report.push(door); return { candidates, report }; }
function summarize(report) { const moved = report.filter(r => r.moved).length, suspects = report.filter(r => Math.abs(num(r.delta, 0)) > 1.25).slice(0, 12); return { total: report.length, moved, suspects }; }
export function groundVillageNow(olam, made = [], final = true, source = "manual") {
  if (!isVillageWorld(olam, made)) return [];
  const { candidates, report } = settleVisuals(olam, made);
  if (final && !olam.__villageFinalCollidersBaked) { olam.__villageFinalCollidersBaked = true; olam.__villageFinalColliderBakedAt = Date.now(); report.push(...bakeFinalColliders(olam, candidates)); }
  const summary = { source, final, ...summarize(report), terrain: olam.awtsmoosTerrainLaw?.source };
  diagEvent("village-grounding", summary);
  diagThrottle("village-grounding-summary", summary, 2200);
  console.info('B"H | VILLAGE_GROUNDING_SUMMARY', summary);
  return report;
}
export function scheduleVillageGrounding(olam, made = []) { if (!isVillageWorld(olam, made) || olam.__villageGroundingScheduled) return; olam.__villageGroundingScheduled = true; const raf = globalThis.requestAnimationFrame || (fn => setTimeout(fn, 32)); const afterFrames = (frames, fn) => frames <= 0 ? fn() : raf(() => afterFrames(frames - 1, fn)); afterFrames(2, () => setTimeout(() => groundVillageNow(olam, made, false, "visual-settle-1"), 180)); afterFrames(5, () => setTimeout(() => groundVillageNow(olam, made, false, "visual-settle-2"), 700)); afterFrames(8, () => setTimeout(() => groundVillageNow(olam, made, true, "final-collider-bake"), 1650)); }
