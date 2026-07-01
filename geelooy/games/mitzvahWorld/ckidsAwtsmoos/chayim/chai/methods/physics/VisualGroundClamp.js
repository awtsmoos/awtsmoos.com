// B"H
/**
 * VisualGroundClamp
 *
 * Purpose:
 * Keeps the visible player body above the physics feet after the capsule has
 * been grounded against real terrain geometry.
 *
 * Runtime owner:
 * Player physics calls this after syncing the capsule root to the latest
 * collision result.
 *
 * Inputs:
 * A Chai/Chossid player with a physics root mesh and optional imported GLB
 * model root.
 *
 * Outputs:
 * A stable local Y lift on visible model roots plus a small diagnostic record
 * on the player.
 *
 * Performance:
 * Measures only the player model roots. It never traverses the world, terrain,
 * houses, or scene children.
 *
 * Fallback:
 * If no visible renderable geometry exists, it leaves the model unchanged and
 * reports zero measured targets. Collision fallback flags are intentionally not
 * visual-ignore flags.
 *
 * Diagnostics:
 * player.__lastVisualGroundClamp reports target count, feet Y, and applied lift.
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
  if (node.userData?.visualGroundIgnore) return false;
  return Boolean(node.isMesh || node.isSkinnedMesh);
}

function targetRoots(player) {
  const out = [];
  if (player?.modelMesh?.isObject3D) out.push(player.modelMesh);
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
  if (maxLift <= 0) {
    player.__lastVisualGroundClamp = { at:Date.now(), feetY, lift:0, lifted:false, targets:roots.length };
    return { lifted:false, lift:0, targets:roots.length };
  }
  for (const root of roots) {
    root.userData ||= {};
    if (root.userData.visualGroundBaseY === undefined) root.userData.visualGroundBaseY = num(root.position?.y, 0);
    root.position.y = num(root.userData.visualGroundBaseY, 0) + maxLift;
    root.userData.visualGroundOffsetY = root.position.y;
    root.updateMatrixWorld?.(true);
  }
  player.mesh.getWorldPosition?.(world);
  player.__lastVisualGroundClamp = { at:Date.now(), feetY, lift:maxLift, lifted:true, worldY:world.y, targets:roots.length };
  return { lifted:true, lift:maxLift, targets:roots.length };
}

export default { clampVisibleBodyAboveFeet };
