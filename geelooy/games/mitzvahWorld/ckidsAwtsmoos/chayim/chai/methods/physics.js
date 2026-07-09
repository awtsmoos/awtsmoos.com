// B"H
/** Jump-safe mesh-ground wrapper: never lets old grounding steal the arc. */
import basePhysics from "./physics/index.js?compact=true&v=up-down-jump-ground-20260709-bh4";
import { clampVisibleBodyAboveFeet } from "./physics/VisualGroundClamp.js?compact=true&v=compact-engine-20260702-bh2";
import { FOOT_GROUND_EPSILON } from "./physics/playerGrounding/FootGroundConstants.js?compact=true&v=compact-engine-20260702-bh2";
import { groundYAt } from "../../../Olam/methods/loadNivrayim/villageGrounding.js?compact=true&v=mesh-ground-authority-20260701-bh1";
import { ensurePlayerCollisionBubble } from "../../../Olam/worlds/mitzvahWorld/collision/PlayerCollisionBubble.js?compact=true&v=jump-air-honest-20260709-bh1";

const TRACE_SEAL = "jump-air-honest-20260709-bh1";
const MIN_AIR_MS = 650;
const LAND_VY = -0.55;
const LAND_GAP = 0.045;
const MOVING_KEYS = ["forward", "backward", "stridingLeft", "stridingRight", "turningLeft", "turningRight", "jump"];
const numberOr = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const jumpAge = entity => Date.now() - Number(entity?.__jumpStartedAt || 0);
const vyOf = entity => numberOr(entity?.velocity?.y, 0);

function rising(entity) {
  return vyOf(entity) > 0.05 || Boolean(entity?.jumped && !entity?.onFloor && vyOf(entity) > LAND_VY) || Boolean(entity?.jumped && jumpAge(entity) < MIN_AIR_MS);
}

function airborne(entity, feetY, groundY) {
  if (rising(entity)) return true;
  if (!entity?.jumped) return entity?.grounded === false || entity?.isOnGround === false;
  if (!Number.isFinite(groundY)) return true;
  return feetY > groundY + LAND_GAP;
}

function modelLocalOffsetY(entity) {
  const data = entity?.modelMesh?.userData || {};
  return numberOr(data.visualGroundOffsetY ?? entity?.visualGroundOffsetY ?? entity?.visualGroundBiasY, 0);
}

function sealModelLocalOffset(entity) {
  const model = entity?.modelMesh, root = entity?.mesh;
  if (!model?.isObject3D || !root?.isObject3D) return;
  const offsetY = modelLocalOffsetY(entity);
  if (model.parent === root) {
    model.position.set(0, offsetY, 0);
    model.rotation.y = numberOr(entity.rotateOffset, 0);
  } else {
    model.position.copy(root.position); model.position.y += offsetY;
    model.rotation.y = numberOr(entity.rotation?.y, 0) + numberOr(entity.rotateOffset, 0);
  }
  model.updateMatrixWorld(true); entity.__lastWriterOfModelY = "physics.js:sealModelLocalOffset";
}

function sealVisualBody(entity) {
  if (!entity?.mesh || !entity?.collider?.start) return;
  const radius = numberOr(entity.collider.radius || entity.radius, 0);
  entity.mesh.position.copy(entity.collider.start); entity.mesh.position.y -= radius;
  entity.mesh.rotation.y = entity.rotation?.y || 0; entity.__lastWriterOfMeshY = "physics.js:sealVisualBody";
  sealModelLocalOffset(entity); entity.emptyCopy?.position?.copy?.(entity.mesh.position);
  entity.nonRotatingEmptyForMovement?.position?.copy?.(entity.mesh.position); clampVisibleBodyAboveFeet(entity);
}

function ensureBaseLimbs(entity) {
  for (const [key, value] of Object.entries(basePhysics)) if (typeof value === "function" && typeof entity[key] !== "function") entity[key] = value;
}

function moving(entity) {
  const m = entity?.moving || {};
  return MOVING_KEYS.some(key => m[key]) || Object.values(entity?.olam?.inputs || {}).some(Boolean) || (entity?.velocity?.lengthSq?.() || 0) > 0.0001;
}

function trace(entity, stage, extra = {}) {
  if (!moving(entity) || !entity?.olam) return;
  entity.olam.__movementTrace ||= [];
  entity.olam.__movementTrace.push({ at:Date.now(), kind:"MESH_GROUND_AUTHORITY", seal:TRACE_SEAL, stage, ...extra });
  entity.olam.__movementTrace = entity.olam.__movementTrace.slice(-160);
}

function snapState(entity) {
  const c = entity?.collider;
  if (!c?.start || !c?.end) return null;
  return { start:c.start.clone(), end:c.end.clone(), velocity:entity.velocity?.clone?.(), jumped:entity.jumped, onFloor:entity.onFloor, grounded:entity.grounded, isOnGround:entity.isOnGround, age:jumpAge(entity) };
}

function restorePrematureLanding(entity, before, dt) {
  if (!before || !entity?.collider?.start || !entity?.__jumpStartedAt) return false;
  const radius = numberOr(entity.collider.radius || entity.radius, 0.45);
  const beforeFeet = before.start.y - radius, nowFeet = entity.collider.start.y - radius;
  const groundY = groundYAt(entity.olam, before.start.x, before.start.z, beforeFeet);
  const highBefore = Number.isFinite(groundY) && beforeFeet > groundY + 0.16;
  const snappedToGround = Number.isFinite(groundY) && nowFeet <= groundY + 0.08;
  const airProtected = before.age < MIN_AIR_MS || numberOr(before.velocity?.y, 0) > LAND_VY;
  if (!(airProtected && highBefore && snappedToGround)) return false;
  entity.collider.start.copy(before.start); entity.collider.end.copy(before.end);
  if (entity.velocity && before.velocity) entity.velocity.copy(before.velocity);
  if (entity.velocity) entity.velocity.y -= numberOr(entity.olam?.GRAVITY, 30) * Math.min(0.05, numberOr(dt, 1 / 60));
  entity.jumped = true; entity.onFloor = entity.grounded = entity.isOnGround = false;
  entity.__prematureLandingRestore = { at:Date.now(), age:before.age, beforeFeet, nowFeet, groundY, vy:entity.velocity?.y };
  trace(entity, "restore-premature-jump-grounding", entity.__prematureLandingRestore); return true;
}

function enforceMeshGround(entity, mode = "frame") {
  const c = entity?.collider, olam = entity?.olam;
  if (!c?.start || !c?.end || !olam) return false;
  const radius = numberOr(c.radius || entity.radius, 0.45), feetY = c.start.y - radius;
  const groundY = groundYAt(olam, c.start.x, c.start.z, feetY);
  if (airborne(entity, feetY, groundY)) { trace(entity, "skip-ground-lock-airborne", { age:jumpAge(entity), vy:vyOf(entity), feetY, groundY }); return false; }
  const bubble = ensurePlayerCollisionBubble(olam); bubble?.updateFromPlayer?.(entity);
  const resolved = bubble?.groundPlayer?.(entity, { slack:FOOT_GROUND_EPSILON, fallbackFn:(x, z, fallback) => groundYAt(olam, x, z, fallback) });
  bubble?.resolveMovement?.(entity); if (resolved) { trace(entity, "bubble-ground-lock", entity.__meshGroundAuthority || {}); return true; }
  if (!Number.isFinite(groundY)) return false;
  const targetFeet = groundY + FOOT_GROUND_EPSILON, gap = feetY - targetFeet;
  if (gap > LAND_GAP && !(entity.onFloor && Math.abs(gap) < 0.18)) return false;
  const lift = targetFeet - feetY; if (!Number.isFinite(lift) || Math.abs(lift) > 0.14) return false;
  c.start.y += lift; c.end.y += lift; if (entity.velocity) entity.velocity.y = 0;
  entity.onFloor = entity.grounded = entity.isOnGround = true; entity.jumped = false;
  entity.__meshGroundAuthority = { at:Date.now(), mode, groundY, lift, x:c.start.x, z:c.start.z };
  entity.__lastWriterOfCapsuleY = "physics.js:enforceMeshGround"; trace(entity, "ground-lock", entity.__meshGroundAuthority); return true;
}

const wrappedPhysics = { ...basePhysics,
  heesHawvoos(dt) { ensureBaseLimbs(this); const before = snapState(this); const result = basePhysics.heesHawvoos.call(this, dt); restorePrematureLanding(this, before, dt); enforceMeshGround(this, "after-base-physics"); sealVisualBody(this); return result; },
  setPosition(vec3) { const result = basePhysics.setPosition.call(this, vec3); enforceMeshGround(this, "set-position"); sealVisualBody(this); return result; }
};
export default wrappedPhysics;
