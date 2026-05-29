// B"H
/**
 * @file physics.js
 * @description Chapter 63: the cache gate is repaired. The wrapper installs
 * every base physics limb onto the living player before calling the base loop,
 * so `_solveDynamicBodies` can never vanish from `this` again.
 */
import basePhysics from "./physics/index.js?v=lean-l1-20260528-bh63";

/** @param {object} entity Chossid-like body. */
function holdVisibleBody(entity) {
  if (!entity?.mesh || !entity?.collider?.start) return;
  entity.mesh.position.copy(entity.collider.start);
  entity.mesh.position.y -= entity.radius || 0;
  entity.mesh.rotation.y = entity.rotation?.y || 0;
  if (entity.modelMesh) {
    entity.modelMesh.position.copy(entity.mesh.position);
    entity.modelMesh.position.y += Number(entity.modelMesh.userData?.visualGroundOffsetY || 0);
    entity.modelMesh.rotation.y = (entity.rotation?.y || 0) + (entity.rotateOffset || 0);
  }
  entity.emptyCopy?.position?.copy?.(entity.mesh.position);
  entity.nonRotatingEmptyForMovement?.position?.copy?.(entity.mesh.position);
}

/** @param {object} entity Runtime player instance. */
function ensureBaseLimbs(entity) {
  for (const [key, value] of Object.entries(basePhysics)) {
    if (typeof value === "function" && typeof entity[key] !== "function") entity[key] = value;
  }
}

const wrappedPhysics = {
  ...basePhysics,

  /** @param {number} dt Frame delta. */
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
