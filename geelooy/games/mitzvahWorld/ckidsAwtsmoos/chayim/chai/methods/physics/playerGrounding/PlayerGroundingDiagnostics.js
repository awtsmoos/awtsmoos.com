// B"H
import * as THREE from "/games/scripts/build/three.module.js";
import { FOOT_GROUND_EPSILON, GROUNDING_SYSTEM, PLAYER_VISIBLE_BODY_CLEARANCE_Y, numberOr, vec } from "./FootGroundConstants.js?v=no-alert-perf-jump-20260701-bh9";
import { capsuleBottomY } from "./CapsuleFootContract.js?v=no-alert-perf-jump-20260701-bh9";
import { cachedLowestWorldY } from "./ModelFootProbe.js?v=no-alert-perf-jump-20260701-bh9";
const W = new THREE.Vector3(), P = new THREE.Vector3();
function ground(player) {
  const hit = player?.__meshGroundAuthority || player?.groundHitResult || {};
  const y = numberOr(hit.groundY ?? hit.position?.y ?? hit.point?.y, NaN);
  return { terrainGroundY:Number.isFinite(y) ? y : null, visibleTerrainY:Number.isFinite(y) ? y : null,
    collisionGroundY:Number.isFinite(y) ? y : null, source:hit.source || hit.object?.name || hit.mesh || null,
    normal:vec(hit.normal), slopeAngle:hit.normal?.y ? Math.acos(Math.max(-1, Math.min(1, hit.normal.y))) : null };
}
function model(player) {
  const m = player?.modelMesh || null, parent = m?.parent || null;
  if (m?.getWorldPosition) m.getWorldPosition(W); if (parent?.getWorldPosition) parent.getWorldPosition(P);
  return { modelRootWorldY:m ? numberOr(W.y, null) : null, modelLocalY:m ? numberOr(m.position?.y, null) : null,
    modelScale:vec(m?.scale), parentName:parent?.name || null, parentWorldY:parent ? numberOr(P.y, null) : null,
    visibleLowestWorldY:m ? cachedLowestWorldY(m) : null, footBaseLocalY:numberOr(m?.userData?.footBaseLocalY, null),
    visualGroundOffsetY:numberOr(m?.userData?.visualGroundOffsetY, null), visualBodyClearanceY:PLAYER_VISIBLE_BODY_CLEARANCE_Y,
    seal:m?.userData?.latestVisibleGroundSeal || null };
}
export function buildPlayerGroundingDiagnostic(player) {
  const g = ground(player), m = model(player), c = player?.collider || {};
  const radius = numberOr(c.radius ?? player?.radius, 0.45), bottom = capsuleBottomY(player);
  const expected = Number.isFinite(g.terrainGroundY) ? g.terrainGroundY + FOOT_GROUND_EPSILON : bottom;
  const capsuleError = Number.isFinite(bottom) && Number.isFinite(expected) ? bottom - expected : null;
  const expectedVisual = Number.isFinite(expected) ? expected + PLAYER_VISIBLE_BODY_CLEARANCE_Y : null;
  const visualError = Number.isFinite(m.visibleLowestWorldY) && Number.isFinite(expectedVisual) ? m.visibleLowestWorldY - expectedVisual : null;
  return { player:{ meshWorldY:numberOr(player?.mesh?.getWorldPosition?.(W)?.y ?? player?.mesh?.position?.y, null), rootWorldY:numberOr(player?.mesh?.position?.y, null), positionY:numberOr(player?.mesh?.position?.y, null), state:player?.__lastAnimKey || null, onFloor:Boolean(player?.onFloor), verticalVelocity:numberOr(player?.velocity?.y, 0) },
    model:m, capsule:{ radius, height:c.end ? (c.end.y - c.start.y) + radius * 2 : null, startY:numberOr(c.start?.y, null), endY:numberOr(c.end?.y, null), bottomY:bottom, centerY:c.start && c.end ? (c.start.y + c.end.y) / 2 : null },
    ground:g, contract:{ epsilon:FOOT_GROUND_EPSILON, clearance:PLAYER_VISIBLE_BODY_CLEARANCE_Y, capsuleBottomY:bottom, expectedCapsuleBottomY:expected, capsuleError, pass:Number.isFinite(capsuleError) ? Math.abs(capsuleError) <= 0.012 : false,
      visualLowestWorldY:m.visibleLowestWorldY, expectedVisibleLowestWorldY:expectedVisual, visualError, visualPass:Number.isFinite(visualError) ? Math.abs(visualError) <= 0.018 : false },
    ownership:{ lastWriterOfMeshY:player?.__lastWriterOfMeshY || null, lastWriterOfModelY:player?.__lastWriterOfModelY || null, lastGroundingSystem:player?.__lastGroundingSystem || GROUNDING_SYSTEM }, warnings:[] };
}
