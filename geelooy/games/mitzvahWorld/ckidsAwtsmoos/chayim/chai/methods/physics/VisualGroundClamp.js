// B"H
/**
 * @file VisualGroundClamp.js
 * @description
 * Keeps the visible player body above the physics feet. The capsule may be
 * perfectly grounded while an imported or fallback model has its local origin in
 * the chest; this shim measures visible child bounds once and applies a stable
 * local lift so robes, hands, and feet never sink below the grass.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const box = new THREE.Box3();
const world = new THREE.Vector3();
const EPSILON = 0.035;

function num(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function isVisibleRenderable(node) {
  if (!node || node.visible === false) return false;
  const data = node.userData || {};
  if (data.skipRaycast || data.skipOctree || data.noOctree || data.visualGroundIgnore) return false;
  return Boolean(node.isMesh || node.isSkinnedMesh);
}

function targetRoots(player) {
  const out = [];
  if (player?.modelMesh?.parent === player.mesh) out.push(player.modelMesh);
  const fallback = player?.mesh?.children?.find(child => child?.userData?.basicVisibleChossidBody);
  if (fallback && !out.includes(fallback)) out.push(fallback);
  return out;
}

function lowestRenderableY(root) {
  let lowest = Infinity;
  root?.updateWorldMatrix?.(true, true);
  root?.traverse?.(node => {
    if (!isVisibleRenderable(node)) return;
    try {
      box.setFromObject(node);
      if (Number.isFinite(box.min.y)) lowest = Math.min(lowest, box.min.y);
    } catch {}
  });
  return lowest;
}

/**
 * @param {object} player Chai/Chossid instance with mesh and optional modelMesh.
 * @returns {{lifted:boolean,lift:number,targets:number}}
 */
export function clampVisibleBodyAboveFeet(player) {
  if (!player?.mesh?.position) return { lifted:false, lift:0, targets:0 };
  const feetY = num(player.mesh.position.y, 0);
  let maxLift = 0;
  const roots = targetRoots(player);
  for (const root of roots) {
    const low = lowestRenderableY(root);
    if (!Number.isFinite(low)) continue;
    maxLift = Math.max(maxLift, feetY + EPSILON - low);
  }
  if (maxLift <= 0) return { lifted:false, lift:0, targets:roots.length };
  for (const root of roots) {
    root.userData ||= {};
    if (root.userData.visualGroundBaseY === undefined) root.userData.visualGroundBaseY = num(root.position?.y, 0);
    root.position.y = num(root.userData.visualGroundBaseY, 0) + maxLift;
    root.userData.visualGroundOffsetY = root.position.y;
    root.updateMatrixWorld?.(true);
  }
  player.mesh.getWorldPosition?.(world);
  player.__lastVisualGroundClamp = { at:Date.now(), feetY, lift:maxLift, worldY:world.y, targets:roots.length };
  return { lifted:true, lift:maxLift, targets:roots.length };
}

export default { clampVisibleBodyAboveFeet };
