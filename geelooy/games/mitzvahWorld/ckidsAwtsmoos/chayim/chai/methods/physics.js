// B"H
/**
 * @file physics.js
 * @description Jump-safe mesh-ground authority wrapper. The Awtsmoos does not
 * raise the visible body by guesswork; feet kiss the ground by measurement while
 * the capsule remains the law of motion.
 */
import basePhysics from "./physics/index.js?compact=true&v=player-stage-timing-20260702-bh1";
import { clampVisibleBodyAboveFeet } from "./physics/VisualGroundClamp.js?compact=true&v=compact-engine-20260702-bh2";
import { FOOT_GROUND_EPSILON } from "./physics/playerGrounding/FootGroundConstants.js?compact=true&v=compact-engine-20260702-bh2";
import { groundYAt } from "../../../Olam/methods/loadNivrayim/villageGrounding.js?compact=true&v=mesh-ground-authority-20260701-bh1";
import { ensurePlayerCollisionBubble } from "../../../Olam/worlds/mitzvahWorld/collision/PlayerCollisionBubble.js?compact=true&v=perf-tight-collision-20260703-bh1";

const TRACE_SEAL = "player-visual-ground-restored-20260702-bh1";
const MOVING_KEYS = ["forward", "backward", "stridingLeft", "stridingRight", "turningLeft", "turningRight", "jump"];
const numberOr = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const rising = entity => Number(entity?.velocity?.y || 0) > 0.05 || Boolean(entity?.jumped && !entity?.onFloor && Number(entity?.velocity?.y || 0) > -0.01);

function modelLocalOffsetY(entity) {
  const data = entity?.modelMesh?.userData || {};
  const explicit = data.visualGroundOffsetY ?? entity?.visualGroundOffsetY ?? entity?.visualGroundBiasY;
  return numberOr(explicit, 0);
}

function sealModelLocalOffset(entity) {
  const model = entity?.modelMesh, root = entity?.mesh;
  if (!model?.isObject3D || !root?.isObject3D) return;
  const offsetY = modelLocalOffsetY(entity);
  if (model.parent === root) {
    model.position.set(0, offsetY, 0);
    model.rotation.y = numberOr(entity.rotateOffset, 0);
    model.updateMatrixWorld(true);
    return;
  }
  model.position.copy(root.position);
  model.position.y += offsetY;
  model.rotation.y = numberOr(entity.rotation?.y, 0) + numberOr(entity.rotateOffset, 0);
  entity.__lastWriterOfModelY = "physics.js:sealModelLocalOffset";
}

function sealVisualBody(entity) {
  if (!entity?.mesh || !entity?.collider?.start) return;
  const radius = numberOr(entity.collider.radius || entity.radius, 0);
  entity.mesh.position.copy(entity.collider.start);
  entity.mesh.position.y -= radius;
  entity.mesh.rotation.y = entity.rotation?.y || 0;
  entity.__lastWriterOfMeshY = "physics.js:sealVisualBody";
  sealModelLocalOffset(entity);
  entity.emptyCopy?.position?.copy?.(entity.mesh.position);
  entity.nonRotatingEmptyForMovement?.position?.copy?.(entity.mesh.position);
  clampVisibleBodyAboveFeet(entity);
}

function ensureBaseLimbs(entity) {
  for (const [key, value] of Object.entries(basePhysics)) if (typeof value === "function" && typeof entity[key] !== "function") entity[key] = value;
}

function moving(entity) {
  const m = entity?.moving || {};
  return MOVING_KEYS.some(k => m[k]) || Object.values(entity?.olam?.inputs || {}).some(Boolean) || (entity?.velocity?.lengthSq?.() || 0) > .0001;
}

function trace(entity, stage, extra = {}) {
  if (!moving(entity)) return;
  entity.olam && (entity.olam.__movementTrace ||= []);
  entity.olam?.__movementTrace?.push?.({ at:Date.now(), kind:"MESH_GROUND_AUTHORITY", seal:TRACE_SEAL, stage, ...extra });
  if (entity.olam?.__movementTrace) entity.olam.__movementTrace = entity.olam.__movementTrace.slice(-120);
}

function enforceMeshGround(entity, mode = "frame") {
  if (rising(entity)) return false;
  const c = entity?.collider, olam = entity?.olam;
  if (!c?.start || !c?.end || !olam) return false;
  const bubble = ensurePlayerCollisionBubble(olam);
  bubble?.updateFromPlayer?.(entity);
  const resolved = bubble?.groundPlayer?.(entity, { slack:FOOT_GROUND_EPSILON, fallbackFn:(x, z, fallback) => groundYAt(olam, x, z, fallback) });
  bubble?.resolveMovement?.(entity);
  if (resolved) { trace(entity, "bubble-ground-lock", entity.__meshGroundAuthority || {}); return true; }
  const radius = numberOr(c.radius || entity.radius, .45), feetY = c.start.y - radius, groundY = groundYAt(olam, c.start.x, c.start.z, feetY);
  if (!Number.isFinite(groundY)) return false;
  const targetFeet = groundY + FOOT_GROUND_EPSILON, closeGrounded = entity.onFloor && Math.abs(feetY - targetFeet) < 1.25;
  if (feetY >= targetFeet && !closeGrounded) return false;
  const lift = targetFeet - feetY;
  if (!Number.isFinite(lift) || Math.abs(lift) > 30) return false;
  c.start.y += lift; c.end.y += lift;
  if (entity.velocity) entity.velocity.y = Math.max(0, numberOr(entity.velocity.y, 0));
  entity.onFloor = true; entity.grounded = true; entity.isOnGround = true;
  entity.__meshGroundAuthority = { at:Date.now(), mode, groundY, lift, x:c.start.x, z:c.start.z };
  entity.__lastWriterOfCapsuleY = "physics.js:enforceMeshGround";
  trace(entity, "ground-lock", entity.__meshGroundAuthority);
  return true;
}

const wrappedPhysics = { ...basePhysics,
  heesHawvoos(dt) {
    ensureBaseLimbs(this);
    if (this.__spikeColliderDisabled) { this.velocity?.set?.(0, 0, 0); this.moving = {}; this.onFloor = false; this.jumped = false; this.didJump = false; sealVisualBody(this); return; }
    const result = basePhysics.heesHawvoos.call(this, dt);
    enforceMeshGround(this, "after-base-physics");
    sealVisualBody(this);
    return result;
  },
  setPosition(vec3) {
    const result = basePhysics.setPosition.call(this, vec3);
    enforceMeshGround(this, "set-position");
    sealVisualBody(this);
    return result;
  }
};
export default wrappedPhysics;
