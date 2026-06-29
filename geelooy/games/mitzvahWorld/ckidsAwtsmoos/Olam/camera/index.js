// B"H
/**
 * @file index.js
 * @description
 * Chapter 53: The Ayin Imported The Breath-Smooth Follow.
 *
 * The Awtsmoos gives the camera a calmer mobile vessel and imports the update
 * loop that smooths target Y, camera distance, and jump collision correction.
 */
import { THREE } from '../rendering/ThreeAdapter.js';
import update from "./methods/update/index.js?v=lava-camera-collision-bypass-20260609-bh643";
import controls from "./methods/controls.js?v=lean-l1-20260528-bh19";
import collision from "./methods/collision.js?v=lean-l1-20260528-bh19";

export default class Ayin {
  constructor(olam) {
    const width = 1920;
    const height = 1080;
    this.olam = olam;
    this.width = width;
    this.height = height;
    this._target = null;
    this.isFPS = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.deltaY = 0;
    this.targetHeight = 0.95;
    this.anchorOffset = new THREE.Vector3(0, 0.15, 0);
    this.amountToStartHidingTarget = 1.52;
    this.amountToHideTargetCompletely = 1.508;
    this.distance = 8.5;
    this.offsetFromWall = 2.2;
    this.maxDistance = 18;
    this.minDistance = 2.2;
    this.speedDistance = 5;
    this.xSpeed = 75.0;
    this.ySpeed = 54.0;
    this.sensitivity = 0.001;
    this.yMinLimit = -18;
    this.yMaxLimit = 48;
    this.movedRotation = null;
    this.zoomRate = 0.018;
    this.rotationDampening = 3.0;
    this.zoomDampening = 5.0;
    this.xDeg = 0.0;
    this.yDeg = 10.0;
    this.currentDistance = this.distance;
    this.desiredDistance = this.distance;
    this.correctedDistance = this.distance;
    this.previousResults = new Map();
    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 10000);
    this.cameraFollower = this.camera.clone();
    olam.scene.add(this.camera);
    this.camera.rotation.order = 'YXZ';
    this.group = new THREE.Group();
    this.camera.add(this.group);
    this.raycaster = new THREE.Raycaster();
    this.mouseRaycaster = new THREE.Raycaster();
    this.playerCollisionBuffer = 0.770;
    this.objectsInScene = [];
    this.userInputTheta = 0;
    this.userInputPhi = 10;
    this.mouseIsDown = false;
    this.rightMouseIsDown = false;
    this.lastDistance = null;
    this.panAmount = 0.5;
    this.modelMesh = null;
    this.sentToOlam = false;
    this.newMovement = false;
    this.__smoothTargetPosition = null;
    this.update = update.bind(this);
    Object.keys(controls).forEach(q => { this[q] = controls[q].bind(this); });
    Object.keys(collision).forEach(q => { this[q] = collision[q].bind(this); });
  }

  get target() { return this._target; }

  set target(v) {
    this._target = v;
    this.__smoothTargetPosition = null;
    if (v && typeof v.height === 'number') this.targetHeight = Math.max(0.8, Math.min(1.15, v.height * 0.62));
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    if (this.cameraFollower) {
      this.cameraFollower.aspect = this.camera.aspect;
      this.cameraFollower.updateProjectionMatrix();
    }
  }

  clampAngle(angle, min, max) {
    if (angle < -360) angle += 360;
    if (angle > 360) angle -= 360;
    return Math.max(Math.min(angle, max), min);
  }
}
