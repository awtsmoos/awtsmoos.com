// B"H
/**
 * @file physics.js
 * @description The visible body and capsule are sealed to the real terrain mesh.
 */
import basePhysics from "./physics/index.js?v=zone-reality-20260614-bh812";
import { groundYAt } from "../../../Olam/methods/loadNivrayim/villageGrounding.js?v=mesh-ground-authority-20260701-bh1";

const TRACE_SEAL = "mesh-ground-authority-20260701-bh1";
const MOVING_KEYS = ["forward", "backward", "stridingLeft", "stridingRight", "turningLeft", "turningRight", "jump"];
const numberOr = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function sealModelLocalOffset(entity) {
  const model = entity?.modelMesh, root = entity?.mesh;
  if (!model?.isObject3D || !root?.isObject3D) return;
  const offsetY = numberOr(model.userData?.visualGroundOffsetY, 0);
  if (model.parent === root) { model.position.set(0, offsetY, 0); model.rotation.y = numberOr(entity.rotateOffset, 0); model.updateMatrixWorld(true); return; }
  model.position.copy(root.position); model.position.y += offsetY; model.rotation.y = numberOr(entity.rotation?.y, 0) + numberOr(entity.rotateOffset, 0);
}

function sealVisualBody(entity) {
  if (!entity?.mesh || !entity?.collider?.start) return;
  const radius = numberOr(entity.collider.radius || entity.radius, 0);
  entity.mesh.position.copy(entity.collider.start);
  entity.mesh.position.y -= radius;
  entity.mesh.rotation.y = entity.rotation?.y || 0;
  sealModelLocalOffset(entity);
  entity.emptyCopy?.position?.copy?.(entity.mesh.position);
  entity.nonRotatingEmptyForMovement?.position?.copy?.(entity.mesh.position);
}

function ensureBaseLimbs(entity) { for (const [key, value] of Object.entries(basePhysics)) if (typeof value === "function" && typeof entity[key] !== "function") entity[key] = value; }
function moving(entity) { const m = entity?.moving || {}; return MOVING_KEYS.some(k => m[k]) || Object.keys(entity?.olam?.inputs || {}).some(k => entity.olam.inputs[k] === true) || (entity?.velocity?.lengthSq?.() || 0) > .0001; }
function v(vector) { return vector ? { x:Number(vector.x), y:Number(vector.y), z:Number(vector.z) } : null; }
function snapshot(entity) { return { moving:Object.fromEntries(MOVING_KEYS.map(k => [k, Boolean(entity?.moving?.[k])])), inputs:Object.keys(entity?.olam?.inputs || {}).filter(k => entity.olam.inputs[k]), mesh:v(entity?.mesh?.position), velocity:v(entity?.velocity), onFloor:Boolean(entity?.onFloor) }; }
function trace(entity, stage, extra = {}) { if (!moving(entity)) return; const now = Date.now(); entity.olam && (entity.olam.__movementTrace ||= []); entity.olam?.__movementTrace?.push?.({ at:now, kind:"MESH_GROUND_AUTHORITY", seal:TRACE_SEAL, stage, ...extra, ...snapshot(entity) }); if (entity.olam?.__movementTrace) entity.olam.__movementTrace = entity.olam.__movementTrace.slice(-120); }

function enforceMeshGround(entity, mode = "frame") {
  const c = entity?.collider, olam = entity?.olam;
  if (!c?.start || !c?.end || !olam) return false;
  const radius = numberOr(c.radius || entity.radius, .45);
  const feetY = c.start.y - radius;
  const groundY = groundYAt(olam, c.start.x, c.start.z, feetY);
  if (!Number.isFinite(groundY)) return false;
  const targetFeet = groundY + .025;
  const closeGrounded = entity.onFloor && Math.abs(feetY - targetFeet) < 1.25;
  if (feetY >= targetFeet && !closeGrounded) return false;
  const lift = targetFeet - feetY;
  if (!Number.isFinite(lift) || Math.abs(lift) > 30) return false;
  c.start.y += lift; c.end.y += lift;
  if (entity.velocity) entity.velocity.y = Math.max(0, numberOr(entity.velocity.y, 0));
  entity.onFloor = true; entity.grounded = true; entity.isOnGround = true;
  entity.__meshGroundAuthority = { at:Date.now(), mode, groundY, lift, x:c.start.x, z:c.start.z };
  trace(entity, "ground-lock", entity.__meshGroundAuthority);
  return true;
}

const wrappedPhysics = {
  ...basePhysics,
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
