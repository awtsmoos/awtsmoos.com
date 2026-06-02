// B"H
/**
 * @file villageGrounding.js
 * @description
 * Chapter 149: The village grounding covenant, now with indoor floor lifts.
 *
 * Future AI, read this before changing village props: DO NOT reintroduce manual
 * Y guessing, repeated per-frame pushing, or flat hardcoded offsets. This module
 * waits until after rendering, raycasts downward to actual terrain, and moves
 * each village vessel by measured world minimum. Living NPCs may carry a small
 * `groundLift` for indoor floors; lava and ladder worlds must not be touched.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const RAY = new THREE.Raycaster();
const DOWN = new THREE.Vector3(0, -1, 0);
const UP = 220;
const FAR = 520;
const VILLAGE_TYPES = new Set(["villagePictureProp", "interactiveNpc", "interactiveDoor", "villageHouseCollider"]);
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;

function isVillageWorld(olam, made = []) {
  const info = olam?.baseInfo || {};
  const id = String(info.id || info.shaym || info.title || "").toLowerCase();
  return id.includes("village") || made.some(n => VILLAGE_TYPES.has(n?.type));
}

function nextPaint(callback) {
  const raf = globalThis.requestAnimationFrame || (fn => setTimeout(fn, 32));
  raf(() => raf(() => callback()));
}

function terrainMeshes(olam) {
  const meshes = [];
  for (const n of olam?.nivrayim || []) if (n?.type === "proceduralTerrain" && n.mesh) meshes.push(n.mesh);
  if (!meshes.length) olam?.scene?.traverse?.(o => { if (o?.userData?.isTerrain) meshes.push(o); });
  return meshes;
}

function worldMinY(root) {
  root?.updateMatrixWorld?.(true);
  const box = new THREE.Box3().setFromObject(root);
  return !box.isEmpty() && Number.isFinite(box.min.y) ? box.min.y : null;
}

function worldPoint(root) {
  const point = new THREE.Vector3();
  root?.getWorldPosition?.(point);
  return point;
}

function groundAt(meshes, x, z) {
  if (!meshes.length) return 0;
  RAY.set(new THREE.Vector3(x, UP, z), DOWN);
  RAY.far = FAR;
  const hits = RAY.intersectObjects(meshes, true).filter(hit => !hit.object?.userData?.skipRaycast);
  return hits[0]?.point?.y ?? 0;
}

function liftOf(nivra) {
  return num(nivra?.options?.groundLift ?? nivra?.groundLift ?? nivra?.originalOptions?.groundLift, 0);
}

function translateRoot(root, delta) {
  if (!root || !Number.isFinite(delta) || Math.abs(delta) < 0.0001) return false;
  root.position.y += delta;
  root.updateMatrixWorld(true);
  return true;
}

function groundStatic(nivra, meshes) {
  const root = nivra?.mesh;
  if (!root?.isObject3D) return null;
  const p = worldPoint(root);
  const groundY = groundAt(meshes, p.x, p.z) + liftOf(nivra);
  const minY = worldMinY(root);
  if (minY === null) return null;
  const moved = translateRoot(root, groundY - minY);
  return { name: nivra.name, type: nivra.type, groundY, minY, moved };
}

function syncLiving(nivra, groundY) {
  if (typeof nivra.setPosition === "function") {
    const p = nivra.mesh?.position || nivra.modelMesh?.position || { x: 0, z: 0 };
    nivra.setPosition(new THREE.Vector3(num(p.x), groundY, num(p.z)));
    nivra.velocity?.set?.(0, 0, 0);
    nivra._syncMesh?.(1 / 60);
  } else if (nivra.mesh?.position) nivra.mesh.position.y = groundY;
}

function groundLiving(nivra, meshes) {
  const root = nivra?.mesh;
  if (!root?.isObject3D) return null;
  const p = worldPoint(root);
  const groundY = groundAt(meshes, p.x, p.z) + liftOf(nivra);
  syncLiving(nivra, groundY);
  const visual = nivra.modelMesh || nivra.mesh;
  const minY = worldMinY(visual);
  if (minY !== null && nivra.modelMesh?.userData) {
    nivra.modelMesh.userData.visualGroundOffsetY = num(nivra.modelMesh.userData.visualGroundOffsetY, 0) + (groundY - minY);
    nivra._syncMesh?.(1 / 60);
  }
  return { name: nivra.name, type: nivra.type, groundY, minY, moved: true };
}

function allCandidates(olam, made) {
  const seen = new Set();
  return [...(made || []), ...(olam?.nivrayim || [])].filter(n => {
    if (!n || seen.has(n)) return false;
    seen.add(n);
    return VILLAGE_TYPES.has(n.type) || n?.mesh?.userData?.villageDecor;
  });
}

export function groundVillageNow(olam, made = []) {
  if (!isVillageWorld(olam, made)) return [];
  const meshes = terrainMeshes(olam);
  const report = [];
  for (const n of allCandidates(olam, made)) report.push(n.type === "interactiveNpc" ? groundLiving(n, meshes) : groundStatic(n, meshes));
  console.info("B\"H | VILLAGE_GROUNDED_BY_RAY", report.filter(Boolean));
  return report.filter(Boolean);
}

export function scheduleVillageGrounding(olam, made = []) {
  if (!isVillageWorld(olam, made)) return;
  nextPaint(() => groundVillageNow(olam, made));
}
