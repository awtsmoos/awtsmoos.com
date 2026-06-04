// B"H
/**
 * @file villageGrounding.js
 * @description
 * Chapter 107: Roads join the grounding covenant.
 * Props, player, NPC, house/fence colliders, and the new simple road collider
 * are all aligned after visual grounding. Beauty stays decorative; collision
 * stays simple, hidden, and true to final transforms.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const RAY = new THREE.Raycaster();
const DOWN = new THREE.Vector3(0, -1, 0);
const UP = 220, FAR = 520;
const TYPES = new Set(["villagePictureProp", "villageTreeField", "villageGrassField", "interactiveNpc", "interactiveDoor", "villageHouseCollider", "villageFenceCollider", "villageRoadCollider", "chossid"]);
const FALLBACK_DOORWAY_LOCAL = new THREE.Vector3(0, 0, 2.68);
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;

function isVillageWorld(olam, made = []) {
  const info = olam?.baseInfo || {}, id = String(info.id || info.shaym || info.title || "").toLowerCase();
  return id.includes("village") || made.some(n => TYPES.has(n?.type));
}
function nextPaint(callback) { const raf = globalThis.requestAnimationFrame || (fn => setTimeout(fn, 32)); raf(() => raf(() => callback())); }
function terrainMeshes(olam) {
  const meshes = [];
  for (const n of olam?.nivrayim || []) if (n?.type === "proceduralTerrain" && n.mesh) meshes.push(n.mesh);
  if (!meshes.length) olam?.scene?.traverse?.(o => { if (o?.userData?.isTerrain) meshes.push(o); });
  return meshes;
}
function terrainLawY(olam, x, z) {
  const law = olam?.awtsmoosTerrainLaw;
  if (!law?.data?.heightPoints) return null;
  let best = null;
  for (const p of law.data.heightPoints) {
    const dx = x - num(law.position?.x) - num(p.x), dz = z - num(law.position?.z) - num(p.z), d = dx * dx + dz * dz;
    if (!best || d < best.d) best = { d, y: num(law.position?.y) + num(p.y) };
  }
  return best ? best.y : null;
}
function worldMinY(root) { root?.updateMatrixWorld?.(true); const box = new THREE.Box3().setFromObject(root); return !box.isEmpty() && Number.isFinite(box.min.y) ? box.min.y : null; }
function worldPoint(root) { const point = new THREE.Vector3(); root?.getWorldPosition?.(point); return point; }
function groundAt(olam, meshes, x, z) {
  const lawY = terrainLawY(olam, x, z);
  if (Number.isFinite(lawY)) return lawY;
  if (!meshes.length) return 0;
  RAY.set(new THREE.Vector3(x, UP, z), DOWN);
  RAY.far = FAR;
  return RAY.intersectObjects(meshes, true).filter(hit => !hit.object?.userData?.skipRaycast)[0]?.point?.y ?? 0;
}
function liftOf(nivra) { return num(nivra?.options?.groundLift ?? nivra?.groundLift ?? nivra?.originalOptions?.groundLift, 0); }
function authoredY(nivra) { return Boolean(nivra?.useAuthoredY || nivra?.options?.useAuthoredY || nivra?.mesh?.userData?.useAuthoredY || nivra?.mesh?.userData?.awtsmoosGrounding?.mode || /Collider$/.test(nivra?.type || "")); }
function translateRoot(root, delta) { if (!root || !Number.isFinite(delta) || Math.abs(delta) < 0.0001) return false; root.position.y += delta; root.updateMatrixWorld(true); return true; }
function groundStatic(olam, nivra, meshes) {
  const root = nivra?.mesh;
  if (!root?.isObject3D) return null;
  if (authoredY(nivra)) return { name: nivra.name, type: nivra.type, authoredY: root.position.y, moved: false };
  const p = worldPoint(root), groundY = groundAt(olam, meshes, p.x, p.z) + liftOf(nivra), minY = worldMinY(root);
  if (minY === null) return null;
  return { name: nivra.name, type: nivra.type, groundY, minY, moved: translateRoot(root, groundY - minY) };
}
function syncLiving(nivra, groundY) {
  if (typeof nivra.setPosition !== "function") { if (nivra.mesh?.position) nivra.mesh.position.y = groundY; return; }
  const p = nivra.mesh?.position || nivra.modelMesh?.position || nivra.position || { x: 0, z: 0 };
  nivra.setPosition(new THREE.Vector3(num(p.x), groundY, num(p.z)));
  nivra.velocity?.set?.(0, 0, 0);
  Object.assign(nivra, { onFloor: true, isOnGround: true, grounded: true });
  nivra._syncMesh?.(1 / 60);
}
function groundLiving(olam, nivra, meshes) {
  const root = nivra?.mesh || nivra?.modelMesh;
  if (!root?.isObject3D) return null;
  const p = worldPoint(root), groundY = groundAt(olam, meshes, p.x, p.z) + liftOf(nivra);
  syncLiving(nivra, groundY);
  const visual = nivra.modelMesh || nivra.mesh, minY = worldMinY(visual);
  if (minY !== null && nivra.modelMesh?.userData) {
    const correction = groundY - minY;
    if (Math.abs(correction) > 0.0001) {
      nivra.modelMesh.userData.visualGroundOffsetY = num(nivra.modelMesh.userData.visualGroundOffsetY, 0) + correction;
      nivra._syncMesh?.(1 / 60);
    }
  }
  return { name: nivra.name, type: nivra.type, groundY, minY, moved: true };
}
function pushUnique(list, item, seen) { if (!item || seen.has(item)) return; seen.add(item); list.push(item); }
function allCandidates(olam, made) {
  const seen = new Set(), list = [];
  for (const n of [...(made || []), ...(olam?.nivrayim || [])]) if (n && (TYPES.has(n.type) || n?.mesh?.userData?.villageDecor)) pushUnique(list, n, seen);
  pushUnique(list, olam?.chossid, seen); pushUnique(list, olam?.player, seen);
  return list;
}
function visualByName(candidates, name) { return candidates.find(n => n?.mesh && n?.name === name); }
function firstKind(candidates, kind) { return candidates.find(n => n?.type === "villagePictureProp" && n.options?.kind === kind); }
function alignDoorToHouse(candidates) {
  const door = candidates.find(n => n?.type === "interactiveDoor" && n.mesh), house = visualByName(candidates, door?.options?.targetName) || firstKind(candidates, "gableHouse");
  if (!door || !house?.mesh) return null;
  if (door.alignToHouseTransform?.(house.mesh)) return { name: door.name, type: door.type, targetName: house.name, method: "contract", moved: true };
  const doorway = FALLBACK_DOORWAY_LOCAL.clone(); house.mesh.localToWorld(doorway); door.mesh.position.copy(doorway); door.mesh.rotation.y = house.mesh.rotation.y; door.mesh.updateMatrixWorld(true);
  return { name: door.name, type: door.type, targetName: house.name, method: "fallback", moved: true };
}
function coupleHouseColliders(olam, candidates) {
  return candidates.filter(n => n?.type === "villageHouseCollider" && n.mesh).map(collider => {
    const visual = visualByName(candidates, collider.options?.targetName) || firstKind(candidates, "gableHouse");
    const aligned = visual?.mesh ? collider.alignToFinalHouseTransform?.(visual.mesh) || false : false;
    return { name: collider.name, type: collider.type, targetName: visual?.name, aligned, octreeMeshesAdded: aligned ? collider.addFinalCollidersToOctree?.(olam) || 0 : 0, floorTopWorldY: collider.floorTopWorldY?.() };
  });
}
function coupleFenceColliders(olam, candidates) {
  return candidates.filter(n => n?.type === "villageFenceCollider" && n.mesh).map(collider => {
    const visual = visualByName(candidates, collider.targetName || collider.options?.targetName);
    const aligned = visual?.mesh ? collider.alignToFinalFenceTransform?.(visual.mesh) || false : false;
    return { name: collider.name, type: collider.type, targetName: collider.targetName, aligned, octreeMeshesAdded: aligned ? collider.addFinalCollidersToOctree?.(olam) || 0 : 0 };
  });
}
function coupleRoadColliders(olam, candidates) {
  return candidates.filter(n => n?.type === "villageRoadCollider" && n.mesh).map(collider => {
    const visual = visualByName(candidates, collider.targetName || collider.options?.targetName) || firstKind(candidates, "pictureDirtPath");
    const aligned = visual?.mesh ? collider.alignToFinalRoadTransform?.(visual.mesh) || false : false;
    return { name: collider.name, type: collider.type, targetName: visual?.name, aligned, octreeMeshesAdded: aligned ? collider.addFinalCollidersToOctree?.(olam) || 0 : 0 };
  });
}

export function groundVillageNow(olam, made = []) {
  if (!isVillageWorld(olam, made)) return [];
  const meshes = terrainMeshes(olam), candidates = allCandidates(olam, made), report = [];
  for (const n of candidates) report.push((n.type === "interactiveNpc" || n.type === "chossid" || n === olam?.player || n === olam?.chossid) ? groundLiving(olam, n, meshes) : groundStatic(olam, n, meshes));
  report.push(alignDoorToHouse(candidates), ...coupleHouseColliders(olam, candidates), ...coupleFenceColliders(olam, candidates), ...coupleRoadColliders(olam, candidates));
  console.info("B\"H | VILLAGE_GROUNDED_FINAL_COLLIDERS", report.filter(Boolean));
  return report.filter(Boolean);
}
export function scheduleVillageGrounding(olam, made = []) {
  if (!isVillageWorld(olam, made)) return;
  [0, 1, 2, 4, 8, 16].forEach(step => nextPaint(() => setTimeout(() => groundVillageNow(olam, made), step * 32)));
}
