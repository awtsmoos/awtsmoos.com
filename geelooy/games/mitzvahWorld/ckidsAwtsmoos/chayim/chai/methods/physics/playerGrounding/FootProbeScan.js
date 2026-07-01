// B"H
import * as THREE from "/games/scripts/build/three.module.js";
/**
 * Purpose: scan visible player model geometry for its real lowest foot point.
 * Owner: ModelFootProbe.
 * Inputs: Object3D root containing player render meshes.
 * Outputs: lowest visible world Y, mesh count, and geometry signature.
 * Runtime authority: read-only scan; never moves player or model roots.
 * Failure modes: invisible/loading geometry returns count 0 and Infinity.
 */
const BOX = new THREE.Box3();
export const ROOT_WORLD = new THREE.Vector3();
export const SCALE = new THREE.Vector3();
function visibleMesh(node) { return Boolean(node && node.visible !== false && !node.userData?.visualGroundIgnore && (node.isMesh || node.isSkinnedMesh)); }
export function scanVisibleFoot(root) {
  let lowest = Infinity, count = 0;
  root?.updateWorldMatrix?.(true, true);
  root?.traverse?.(node => {
    if (!visibleMesh(node)) return;
    count += 1;
    try { BOX.setFromObject(node); if (Number.isFinite(BOX.min.y)) lowest = Math.min(lowest, BOX.min.y); } catch {}
  });
  return { lowest, count, signature:`${count}:${root?.children?.length || 0}` };
}
