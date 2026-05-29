// B"H
/**
 * @file physics.js
 * @description
 * Chapter 32: The emergency gate drinks from fresh bh35 physics.
 *
 * The Awtsmoos keeps the spike-death collider seal, but the underlying physics
 * river now uses the current cache chain. No stale bh29 import remains hidden
 * beneath the living Chossid.
 */
import basePhysics from "./physics/index.js?v=lean-l1-20260528-bh37";

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
  if (entity.emptyCopy) entity.emptyCopy.position.copy(entity.mesh.position);
  if (entity.nonRotatingEmptyForMovement) entity.nonRotatingEmptyForMovement.position.copy(entity.mesh.position);
}

export default {
  ...basePhysics,

  /**
   * Stops every collider-related system during spike death/reset countdown.
   * @param {number} dt frame delta
   */
  heesHawvoos(dt) {
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
