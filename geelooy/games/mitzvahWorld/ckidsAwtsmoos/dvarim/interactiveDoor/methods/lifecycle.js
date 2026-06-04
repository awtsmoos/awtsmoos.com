// B"H
/**
 * @file lifecycle.js
 * @description
 * Chapter 333: An open door is not a wall.
 *
 * The Awtsmoos removed the old betrayal: the door was removed from the octree
 * while moving, then re-added when fully open. Now open means passable. Only the
 * closed final angle re-enters collision.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { DOOR_DEFAULTS } from '../constants.js';

function removeDoorCollider(door) {
  if (!door._removedFromOctree && door.isSolid && door.olam?.worldOctree) {
    door.olam.worldOctree.removeMesh(door.mesh);
    door._removedFromOctree = true;
  }
}
function addDoorColliderIfClosed(door) {
  if (door.isOpen || door._isMoving) return;
  if (door._removedFromOctree && door.isSolid && door.olam?.worldOctree) {
    door.olam.worldOctree.addObject(door.mesh);
    door._removedFromOctree = false;
  }
}

export default {
  /** @method heescheel @description Initialization in the world. */
  async heescheel(olam) {
    this.olam = olam;
    await this._superHeescheel(olam);
    if (!this.mesh || !this.mesh.geometry || this.mesh.geometry.attributes.position.count < 30) {
      const geo = this.buildGeometryManually();
      const matArray = [
        new THREE.MeshLambertMaterial({ color: "#8a5a32" }),
        new THREE.MeshStandardMaterial({ color: "#FFD700", metalness: 1.0, roughness: 0.1 })
      ];
      const par = this.mesh?.parent || null;
      if (par) par.remove(this.mesh);
      this.mesh = new THREE.Mesh(geo, matArray);
      if (par) par.add(this.mesh);
    }
    this.mesh.name = this.name || "Interactive Gateway";
    this.mesh.nivraAwtsmoos = this;
    if (this.position) this.mesh.position.copy(this.position.vector3 ? this.position.vector3() : this.position);
    this.mesh.rotation.y = this.baseRotY;
    Object.assign(this.mesh.userData ||= {}, { isSolid: true, isDoor: true, explicitCollision: true });
    this.isSolid = true;
    await olam.hoyseef(this);
    if (this.olam.interactiveOctree) this.olam.interactiveOctree.fromGraphNode(this.mesh);
    this.isReady = true;
  },

  /** @method heesHawvoos @description Smooths visual angle and collision state. */
  heesHawvoos(dt) {
    this._superHeesHawvoos(dt);
    if (!this.mesh) return;
    if (this.isOpen || this._isMoving) removeDoorCollider(this);
    if (!this._isMoving) { addDoorColliderIfClosed(this); return; }
    const diff = this.targetAngle - this.currentAngle;
    if (Math.abs(diff) > DOOR_DEFAULTS.angleThreshold) {
      this.currentAngle = THREE.MathUtils.lerp(this.currentAngle, this.targetAngle, dt * DOOR_DEFAULTS.lerpSpeed);
    } else {
      this.currentAngle = this.targetAngle;
      this._isMoving = false;
    }
    this.mesh.rotation.y = this.baseRotY + this.currentAngle;
    this.mesh.updateMatrixWorld(true);
    if (!this.isOpen && !this._isMoving) addDoorColliderIfClosed(this);
  }
};
