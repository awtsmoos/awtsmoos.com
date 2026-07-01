// B"H
import * as THREE from "/games/scripts/build/three.module.js";
import { FOOT_GROUND_EPSILON, GROUNDING_SYSTEM, numberOr, vec } from "./FootGroundConstants.js?v=player-foot-ground-contract-20260701-bh3";
import { capsuleBottomY } from "./CapsuleFootContract.js?v=player-foot-ground-contract-20260701-bh3";
import { cachedLowestWorldY } from "./ModelFootProbe.js?v=player-foot-ground-contract-20260701-bh3";

const W = new THREE.Vector3();
const P = new THREE.Vector3();

function ground(player) {
  const hit = player?.__meshGroundAuthority || player?.groundHitResult || {};
  const y = numberOr(hit.groundY ?? hit.position?.y ?? hit.point?.y, NaN);
  return {
    terrainGroundY:Number.isFinite(y) ? y : null,
    visibleTerrainY:Number.isFinite(y) ? y : null,
    collisionGroundY:Number.isFinite(y) ? y : null,
    source:hit.source || hit.object?.name || hit.mesh || null,
    normal:vec(hit.normal),
    slopeAngle:hit.normal?.y ? Math.acos(Math.max(-1, Math.min(1, hit.normal.y))) : null
  };
}

function model(player) {
  const m = player?.modelMesh || null;
  const parent = m?.parent || null;
  if (m?.getWorldPosition) m.getWorldPosition(W);
  if (parent?.getWorldPosition) parent.getWorldPosition(P);
  return {
    modelRootWorldY:m ? numberOr(W.y, null) : null,
    modelLocalY:m ? numberOr(m.position?.y, null) : null,
    modelScale:vec(m?.scale),
    parentName:parent?.name || null,
    parentWorldY:parent ? numberOr(P.y, null) : null,
    visibleLowestWorldY:m ? cachedLowestWorldY(m) : null,
    footBaseLocalY:numberOr(m?.userData?.footBaseLocalY, null),
    visualGroundOffsetY:numberOr(m?.userData?.visualGroundOffsetY, null)
  };
}

export function buildPlayerGroundingDiagnostic(player) {
  const g = ground(player), m = model(player), c = player?.collider || {};
  const radius = numberOr(c.radius ?? player?.radius, 0.45);
  const bottom = capsuleBottomY(player);
  const foot = Number.isFinite(m.visibleLowestWorldY) ? m.visibleLowestWorldY : bottom;
  const expected = Number.isFinite(g.terrainGroundY) ? g.terrainGroundY + FOOT_GROUND_EPSILON : null;
  const error = Number.isFinite(foot) && Number.isFinite(expected) ? foot - expected : null;
  return {
    player:{ meshWorldY:numberOr(player?.mesh?.getWorldPosition?.(W)?.y ?? player?.mesh?.position?.y, null), rootWorldY:numberOr(player?.mesh?.position?.y, null), positionY:numberOr(player?.mesh?.position?.y, null), state:player?.__lastAnimKey || null, onFloor:Boolean(player?.onFloor), verticalVelocity:numberOr(player?.velocity?.y, 0) },
    model:m,
    capsule:{ radius, height:c.end ? (c.end.y - c.start.y) + radius * 2 : null, startY:numberOr(c.start?.y, null), endY:numberOr(c.end?.y, null), bottomY:bottom, centerY:c.start && c.end ? (c.start.y + c.end.y) / 2 : null },
    ground:g,
    contract:{ epsilon:FOOT_GROUND_EPSILON, footWorldY:foot, expectedFootWorldY:expected, error, pass:Number.isFinite(error) ? Math.abs(error) <= 0.012 : false },
    ownership:{ lastWriterOfMeshY:player?.__lastWriterOfMeshY || null, lastWriterOfModelY:player?.__lastWriterOfModelY || null, lastGroundingSystem:player?.__lastGroundingSystem || GROUNDING_SYSTEM },
    warnings:[]
  };
}
