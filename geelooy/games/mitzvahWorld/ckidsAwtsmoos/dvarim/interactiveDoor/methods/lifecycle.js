// B"H
/**
 * @file lifecycle.js
 * @description
 * Door lifecycle for collision truth: initialize the visual door, remove the
 * collider while the door opens, and re-add it only when fully closed.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { DOOR_DEFAULTS } from '../constants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import {
  markDoorPassable,
  markDoorSolid,
  syncDoorColliderUserData
} from './DoorColliderState.js?compact=true&v=door-collider-state-20260629-bh1';

function removeDoorCollider(door) {
  markDoorPassable(door);
  if (!door._removedFromOctree && door.olam?.worldOctree) {
    door.olam.worldOctree.removeMesh(door.mesh);
    door._removedFromOctree = true;
  }
}

function addDoorColliderIfClosed(door) {
  if (door.isOpen || door._isMoving) return;
  markDoorSolid(door);
  if (door._removedFromOctree && door.olam?.worldOctree) {
    door.olam.worldOctree.addObject(door.mesh);
    door._removedFromOctree = false;
  }
}

function ensureDoorMesh(door) {
  if (door.mesh && door.mesh.geometry && door.mesh.geometry.attributes.position.count >= 30) return;
  const geometry = door.buildGeometryManually();
  const material = [
    new THREE.MeshLambertMaterial({ color: "#8a5a32" }),
    new THREE.MeshStandardMaterial({ color: "#FFD700", metalness: 1.0, roughness: 0.1 })
  ];
  const parent = door.mesh?.parent || null;
  if (parent) parent.remove(door.mesh);
  door.mesh = new THREE.Mesh(geometry, material);
  if (parent) parent.add(door.mesh);
}

export default {
  async heescheel(olam) {
    this.olam = olam;
    await this._superHeescheel(olam);
    ensureDoorMesh(this);

    this.mesh.name = this.name || "Interactive Gateway";
    this.mesh.nivraAwtsmoos = this;
    if (this.position) this.mesh.position.copy(this.position.vector3 ? this.position.vector3() : this.position);
    this.mesh.rotation.y = this.baseRotY;
    this.currentAngle = Number.isFinite(Number(this.currentAngle)) ? Number(this.currentAngle) : 0;
    this.targetAngle = Number.isFinite(Number(this.targetAngle)) ? Number(this.targetAngle) : 0;
    syncDoorColliderUserData(this);

    await olam.hoyseef(this);
    if (this.olam.interactiveOctree) this.olam.interactiveOctree.fromGraphNode(this.mesh);
    this.isReady = true;
  },

  heesHawvoos(dt) {
    this._superHeesHawvoos(dt);
    if (!this.mesh) return;

    if (this.isOpen || this._isMoving) removeDoorCollider(this);
    if (!this._isMoving) {
      addDoorColliderIfClosed(this);
      return;
    }

    const diff = this.targetAngle - this.currentAngle;
    if (Math.abs(diff) > DOOR_DEFAULTS.angleThreshold) {
      this.currentAngle = THREE.MathUtils.lerp(this.currentAngle, this.targetAngle, dt * DOOR_DEFAULTS.lerpSpeed);
    } else {
      this.currentAngle = this.targetAngle;
      this._isMoving = false;
    }

    this.mesh.rotation.y = this.baseRotY + this.currentAngle;
    this.mesh.updateMatrixWorld(true);
    syncDoorColliderUserData(this);
    if (!this.isOpen && !this._isMoving) addDoorColliderIfClosed(this);
  }
};
