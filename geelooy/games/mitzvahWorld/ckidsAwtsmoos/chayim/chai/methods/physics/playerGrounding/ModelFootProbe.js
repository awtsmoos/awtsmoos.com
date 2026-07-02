// B"H
import { PLAYER_VISIBLE_BODY_CLEARANCE_Y, numberOr } from "./FootGroundConstants.js?v=no-compact-engine-20260702-bh2";
import { ROOT_WORLD, SCALE, scanVisibleFoot } from "./FootProbeScan.js?v=no-compact-engine-20260702-bh2";
export function playerVisualRoots(player) {
  const roots = [];
  if (player?.modelMesh?.isObject3D) roots.push(player.modelMesh);
  const fallback = player?.mesh?.getObjectByName?.("BASIC_VISIBLE_CHOSSID_BODY");
  if (fallback && !roots.includes(fallback)) roots.push(fallback);
  return roots;
}
function markWaiting(root, count) {
  Object.assign(root.userData, { chossidFootBaseMeasured:false, footProbeWaitingForVisibleGeometry:true, footProbeRenderableCount:count });
  return root.userData;
}
export function measureFootBase(root) {
  root.userData ||= {};
  const scan = scanVisibleFoot(root);
  if (scan.count < 1 || !Number.isFinite(scan.lowest)) return markWaiting(root, scan.count);
  root.getWorldPosition(ROOT_WORLD); root.getWorldScale(SCALE);
  const scaleY = Math.max(0.000001, Math.abs(numberOr(SCALE.y, 1)));
  Object.assign(root.userData, { chossidFootBaseMeasured:true, footProbeWaitingForVisibleGeometry:false,
    footProbeRenderableCount:scan.count, footProbeSignature:scan.signature,
    footBaseLocalY:(scan.lowest - ROOT_WORLD.y) / scaleY,
    visualBodyClearanceY:PLAYER_VISIBLE_BODY_CLEARANCE_Y, footBaseMeasuredAt:Date.now() });
  return root.userData;
}
export function targetModelLocalY(root) {
  const data = measureFootBase(root);
  if (!data.chossidFootBaseMeasured) return numberOr(root.userData?.visualGroundOffsetY, PLAYER_VISIBLE_BODY_CLEARANCE_Y);
  const scaleY = Math.max(0.000001, Math.abs(numberOr(root.scale?.y, 1)));
  const localY = PLAYER_VISIBLE_BODY_CLEARANCE_Y - numberOr(data.footBaseLocalY, 0) * scaleY;
  root.userData.visualGroundOffsetY = localY;
  root.userData.visualBodyClearanceY = PLAYER_VISIBLE_BODY_CLEARANCE_Y;
  return localY;
}
export function sealLowestVisibleToWorldY(root, targetWorldY) {
  root.userData ||= {};
  root.updateWorldMatrix?.(true, true);
  const scan = scanVisibleFoot(root);
  if (scan.count < 1 || !Number.isFinite(scan.lowest) || !Number.isFinite(targetWorldY)) return null;
  const delta = targetWorldY - scan.lowest;
  if (!Number.isFinite(delta) || Math.abs(delta) > 30) return null;
  if (Math.abs(delta) > 0.000001) { root.position.y += delta; root.updateMatrixWorld?.(true); }
  const seal = { at:Date.now(), targetWorldY, beforeLowestWorldY:scan.lowest, afterLowestWorldY:scan.lowest + delta, delta, signature:scan.signature };
  Object.assign(root.userData, { footWorldSealDone:true, footWorldSealSignature:scan.signature, footWorldSeal:seal, visualGroundSealEveryFrame:true, visualBodyClearanceY:PLAYER_VISIBLE_BODY_CLEARANCE_Y });
  return seal;
}
export function cachedLowestWorldY(root) {
  if (!root?.getWorldPosition) return null;
  root.updateWorldMatrix?.(true, true);
  const scan = scanVisibleFoot(root);
  return Number.isFinite(scan.lowest) ? scan.lowest : null;
}
