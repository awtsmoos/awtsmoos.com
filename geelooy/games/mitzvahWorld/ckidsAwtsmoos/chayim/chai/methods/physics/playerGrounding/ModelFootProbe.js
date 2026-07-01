// B"H
import { FOOT_GROUND_EPSILON, numberOr } from "./FootGroundConstants.js?v=player-visible-above-ground-20260701-bh5";
import { ROOT_WORLD, SCALE, scanVisibleFoot } from "./FootProbeScan.js?v=player-visible-above-ground-20260701-bh5";
/**
 * Purpose: keep the rendered player body above the capsule foot every frame.
 * Owner: ApplyPlayerFootGrounding.
 * Inputs: player mesh/model roots and the current visual geometry bounds.
 * Outputs: model-local offset, live sole sealing, and diagnostics.
 * Runtime authority: writes only player-owned visible model roots.
 * Update order: sync root to capsule foot, place model, then seal lowest visible Y.
 * Callers: ApplyPlayerFootGrounding and PlayerGroundingDiagnostics.
 * Invariants: no stale seal cache may keep the body underground.
 * Failure modes: invisible/loading geometry preserves the prior local offset.
 */
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
    footGroundEpsilon:FOOT_GROUND_EPSILON, footBaseMeasuredAt:Date.now() });
  return root.userData;
}
export function targetModelLocalY(root) {
  const data = measureFootBase(root);
  if (!data.chossidFootBaseMeasured) return numberOr(root.userData?.visualGroundOffsetY, 0);
  const scaleY = Math.max(0.000001, Math.abs(numberOr(root.scale?.y, 1)));
  const localY = FOOT_GROUND_EPSILON - numberOr(data.footBaseLocalY, 0) * scaleY;
  root.userData.visualGroundOffsetY = localY;
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
  Object.assign(root.userData, { footWorldSealDone:true, footWorldSealSignature:scan.signature, footWorldSeal:seal, visualGroundSealEveryFrame:true });
  return seal;
}
export function cachedLowestWorldY(root) {
  if (!root?.getWorldPosition) return null;
  root.updateWorldMatrix?.(true, true);
  const scan = scanVisibleFoot(root);
  return Number.isFinite(scan.lowest) ? scan.lowest : null;
}
