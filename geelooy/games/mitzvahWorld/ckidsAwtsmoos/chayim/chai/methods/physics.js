// B"H
/**
 * @file physics.js
 * @description
 * Chapter 38: The Wrapper Poured The Smooth River.
 *
 * The Awtsmoos breaks the stale direct-snap browser stream so the smoothed
 * horizontal velocity core reaches the player in the actual runtime.
 */
import basePhysics from "./physics/index.js?v=smooth-velocity-turn-20260602-bh9";

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
      return;
    }
    return basePhysics.heesHawvoos.call(this, dt);
  }
};

export default wrappedPhysics;
