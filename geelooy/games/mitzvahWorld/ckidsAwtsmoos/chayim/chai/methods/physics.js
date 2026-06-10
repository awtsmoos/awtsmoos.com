// B"H
/**
 * @file physics.js
 * @description
 * Chapter 323: The feet now testify after every real physics breath.
 *
 * The Awtsmoos does not accept “input reached physics” as a slogan. This wrapper
 * records before/after position, velocity, movement flags, and model/fallback
 * state when movement intent exists. If the wall still refuses motion, the next
 * console line names the exact broken gate.
 */
import basePhysics from "./physics/index.js?v=terrain-law-floor-fallback-20260603-bh322";

const TRACE_SEAL = "physics-motion-trace-20260610-bh708";
const MOVING_KEYS = ["forward", "backward", "stridingLeft", "stridingRight", "turningLeft", "turningRight", "jump"];

/** @param {object} entity Chossid-like body. @returns {void} */
function holdVisibleBody(entity) {
  if (!entity?.mesh || !entity?.collider?.start) return;
  const radius = entity.collider.radius || entity.radius || 0;
  entity.mesh.position.copy(entity.collider.start);
  entity.mesh.position.y -= radius;
  entity.mesh.rotation.y = entity.rotation?.y || 0;
  if (entity.modelMesh) {
    entity.modelMesh.position.copy(entity.mesh.position);
    entity.modelMesh.position.y += Number(entity.modelMesh.userData?.visualGroundOffsetY || 0);
    entity.modelMesh.rotation.y = (entity.rotation?.y || 0) + (entity.rotateOffset || 0);
  }
  entity.emptyCopy?.position?.copy?.(entity.mesh.position);
  entity.nonRotatingEmptyForMovement?.position?.copy?.(entity.mesh.position);
}

/** @param {object} entity Runtime player instance. @returns {void} */
function ensureBaseLimbs(entity) {
  for (const [key, value] of Object.entries(basePhysics)) {
    if (typeof value === "function" && typeof entity[key] !== "function") entity[key] = value;
  }
}

/** @param {object} entity Runtime player. @returns {boolean} True when movement is requested or present. */
function shouldTrace(entity) {
  const moving = entity?.moving || {};
  const hasMoveFlag = MOVING_KEYS.some(key => moving[key]);
  const hasInputFlag = Object.keys(entity?.olam?.inputs || {}).some(key => entity.olam.inputs[key] === true);
  const hasVelocity = (entity?.velocity?.lengthSq?.() || 0) > 0.0001;
  return hasMoveFlag || hasInputFlag || hasVelocity;
}

/** @param {object} vector Three vector. @returns {object|null} Plain vector. */
function v(vector) {
  return vector ? { x: Number(vector.x), y: Number(vector.y), z: Number(vector.z) } : null;
}

/** @param {object} entity Runtime player. @returns {object} Snapshot. */
function snapshot(entity) {
  return {
    moving: Object.fromEntries(MOVING_KEYS.map(key => [key, Boolean(entity?.moving?.[key])])),
    inputs: Object.keys(entity?.olam?.inputs || {}).filter(key => entity.olam.inputs[key]),
    mesh: v(entity?.mesh?.position),
    model: v(entity?.modelMesh?.position),
    velocity: v(entity?.velocity),
    onFloor: Boolean(entity?.onFloor),
    visibleBody: entity?.__visibleBodyState || null,
    fallback: Boolean(entity?.mesh?.getObjectByName?.("BASIC_VISIBLE_CHOSSID_BODY"))
  };
}

/** @param {object} entity Runtime player. @param {string} stage Stage. @param {object} extra Extra payload. */
function trace(entity, stage, extra = {}) {
  if (!shouldTrace(entity)) return;
  const now = Date.now();
  if (stage === "before" && entity.__lastPhysicsTraceAt && now - entity.__lastPhysicsTraceAt < 280) return;
  if (stage === "before") entity.__lastPhysicsTraceAt = now;
  const payload = { seal: TRACE_SEAL, stage, ...extra, ...snapshot(entity) };
  entity.olam.__movementTrace ||= [];
  entity.olam.__movementTrace.push({ at: now, kind: "PHYSICS_MOTION_TRACE", ...payload });
  entity.olam.__movementTrace = entity.olam.__movementTrace.slice(-200);
  console.info('B"H | PHYSICS_MOTION_TRACE', payload);
}

const wrappedPhysics = {
  ...basePhysics,

  /** @param {number} dt Frame delta. @returns {unknown} */
  heesHawvoos(dt) {
    ensureBaseLimbs(this);
    if (this.__spikeColliderDisabled) {
      this.velocity?.set?.(0, 0, 0);
      this.moving = {};
      this.onFloor = false;
      this.jumped = false;
      this.didJump = false;
      holdVisibleBody(this);
      trace(this, "spike-disabled", { dt });
      return;
    }
    trace(this, "before", { dt });
    const before = this.mesh?.position?.clone?.();
    const result = basePhysics.heesHawvoos.call(this, dt);
    const moved = before && this.mesh?.position ? before.distanceTo(this.mesh.position) : 0;
    trace(this, "after", { dt, moved });
    return result;
  }
};

export default wrappedPhysics;
