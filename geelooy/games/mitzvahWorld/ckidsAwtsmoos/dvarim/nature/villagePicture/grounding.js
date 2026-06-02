// B"H
/**
 * @file grounding.js
 * @description
 * Chapter 8: The village earth stops lying through random meshes. The Awtsmoos
 * now pins decorative roots by measured visible bounds, and only raycasts
 * against terrain-like ground when that ground can be recognized. Houses,
 * lamps, flowers, and NPC bodies are never allowed to use their own roofs,
 * hats, doors, or old panels as the earth beneath them.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const DOWN = new THREE.Vector3(0, -1, 0);
const RAY = new THREE.Raycaster();
const ORIGIN = new THREE.Vector3();
const DEFAULT_GROUND_Y = -0.05;
const DEFAULT_LIFT = 0;
const LIVING_GROUND_KEY = "visualGroundOffsetY";
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function measuredBox(root) {
  if (!root?.updateMatrixWorld) return null;
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  return Number.isFinite(box.min.y) && Number.isFinite(box.max.y) && !box.isEmpty() ? box : null;
}

function isInside(child, root) {
  for (let node = child; node; node = node.parent) if (node === root) return true;
  return false;
}

function isTerrainLike(child) {
  const text = `${child?.name || ""} ${child?.parent?.name || ""}`.toLowerCase();
  return Boolean(child?.userData?.isTerrain || child?.nivraAwtsmoos?.type === "proceduralTerrain" || text.includes("terrain") || text.includes("ground"));
}

function groundCandidates(scene, root) {
  const out = [];
  scene?.traverse?.(child => {
    if (!child?.isMesh || !child.geometry || child.visible === false) return;
    if (isInside(child, root) || !isTerrainLike(child)) return;
    out.push(child);
  });
  return out;
}

export function fallbackGroundY(options = {}) {
  if (options.skipAutoGround) return null;
  return finite(options.groundY ?? options.worldGroundY, DEFAULT_GROUND_Y);
}

export function terrainRayGroundY(root, scene, box, options = {}) {
  const fallback = fallbackGroundY(options);
  if (!scene || options.skipVillageRayGround) return fallback;
  ORIGIN.set((box.min.x + box.max.x) / 2, box.max.y + 40, (box.min.z + box.max.z) / 2);
  RAY.set(ORIGIN, DOWN);
  RAY.near = 0;
  RAY.far = 120;
  const hits = RAY.intersectObjects(groundCandidates(scene, root), true);
  const hit = hits.find(row => Number.isFinite(row.point?.y));
  return Number.isFinite(hit?.point?.y) ? hit.point.y : fallback;
}

export function pinRootToGround(root, options = {}, mode = "flat-pin", pass = 0) {
  const box = measuredBox(root);
  const targetY = fallbackGroundY(options);
  const lift = finite(options.groundLift, DEFAULT_LIFT);
  if (!box || !Number.isFinite(targetY)) return { grounded: false, groundY: targetY, lift, deltaY: 0, mode, pass };
  const deltaY = targetY + lift - box.min.y;
  if (Math.abs(deltaY) > 0.00001) root.position.y += deltaY;
  root.userData ||= {};
  root.userData.awtsmoosGrounding = { mode, pass, groundY: targetY, lift, deltaY, minYBefore: box.min.y };
  root.updateMatrixWorld(true);
  return { grounded: true, groundY: targetY, lift, deltaY, mode, pass };
}

export function groundPictureProp(root, options = {}) {
  return pinRootToGround(root, options, "immediate-flat-pin", 0);
}

export function groundPicturePropToVillageRay(root, scene, options = {}, pass = 0) {
  const box = measuredBox(root);
  const lift = finite(options.groundLift, DEFAULT_LIFT);
  if (!box) return { grounded: false, groundY: null, lift, deltaY: 0, mode: "village-terrain-ray", pass };
  const groundY = terrainRayGroundY(root, scene, box, options);
  if (!Number.isFinite(groundY)) return pinRootToGround(root, options, "terrain-ray-fallback-flat", pass);
  const deltaY = groundY + lift - box.min.y;
  if (Math.abs(deltaY) > 0.00001) root.position.y += deltaY;
  root.userData ||= {};
  root.userData.awtsmoosGrounding = { mode: "village-terrain-ray", pass, groundY, lift, deltaY, minYBefore: box.min.y };
  root.updateMatrixWorld(true);
  return { grounded: true, groundY, lift, deltaY, mode: "village-terrain-ray", pass };
}

export function pinLivingVisualToGround(owner, options = {}, pass = 0) {
  const visual = owner?.modelMesh || owner?.visualObject || owner?.guf || owner?.mesh;
  const box = measuredBox(visual);
  const groundY = fallbackGroundY(options);
  const lift = finite(options.groundLift, DEFAULT_LIFT);
  if (!visual || !box || !Number.isFinite(groundY)) return { grounded: false, groundY, lift, deltaY: 0, pass };
  const deltaY = groundY + lift - box.min.y;
  if (Math.abs(deltaY) > 0.00001) {
    visual.position.y += deltaY;
    visual.userData ||= {};
    visual.userData[LIVING_GROUND_KEY] = finite(visual.userData[LIVING_GROUND_KEY], 0) + deltaY;
  }
  visual.userData.awtsmoosLivingGrounding = { mode: "living-flat-pin", pass, groundY, lift, deltaY, minYBefore: box.min.y };
  visual.userData.awtsmoosLivingGrounded = true;
  owner.visualYOffset = -finite(visual.userData[LIVING_GROUND_KEY], 0);
  visual.updateMatrixWorld(true);
  return { grounded: true, groundY, lift, deltaY, mode: "living-flat-pin", pass };
}

export function groundLivingVisualToVillageRay(owner, scene, options = {}, pass = 0) {
  const visual = owner?.modelMesh || owner?.visualObject || owner?.guf || owner?.mesh;
  const box = measuredBox(visual);
  if (!visual || !box) return { grounded: false, groundY: null, lift: finite(options.groundLift), deltaY: 0, pass };
  const rayY = terrainRayGroundY(visual, scene, box, options);
  return pinLivingVisualToGround(owner, { ...options, groundY: Number.isFinite(rayY) ? rayY : fallbackGroundY(options) }, pass);
}
