// B"H
/**
 * @file index.js
 * @description
 * Chapter 410: The robe is tied to the feet.
 *
 * The Awtsmoos reveals motion through vessels: the collider is the hidden decree,
 * the empty root is the walking throne, and the visible model is the garment
 * that must be lashed to that throne instead of wandering as a lonely scene
 * child. This Chai breath binds the model under the moving root immediately, so
 * even before the next physics frame the Chossid has a visible body at spawn.
 */
import Tzomayach from "../tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';
import { Capsule } from '../../Olam/math/Capsule.js';
import visualMethods from "./methods/visuals.js?v=exact-visual-feet-20260603-bh388";
import movementMethods from "./methods/movement.js";
import physicsMethods from "./methods/physics.js?v=visible-root-binding-20260610-bh710";
import raycastingMethods from "./methods/raycasting.js";
import { PHYSICS_CONSTANTS } from "./methods/physics/physicsConstants.js";
import ChasveiAwtsmoos from '../../utils/ChasveiAwtsmoos.js';

const numberOr = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;

/** @param {THREE.Object3D} root Moving root. @param {THREE.Object3D} model Visible garment. */
function bindModelToMovingRoot(root, model) {
  if (!root?.isObject3D || !model?.isObject3D || model === root) return;
  model.updateMatrixWorld(true);
  const worldPosition = new THREE.Vector3();
  const worldQuaternion = new THREE.Quaternion();
  const worldScale = new THREE.Vector3();
  model.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);
  if (model.parent !== root) root.add(model);
  model.position.set(0, Number(model.userData?.visualGroundOffsetY || 0), 0);
  model.quaternion.copy(root.quaternion).invert().multiply(worldQuaternion);
  if (Number.isFinite(worldScale.x) && Number.isFinite(worldScale.y) && Number.isFinite(worldScale.z)) model.scale.copy(worldScale);
  model.updateMatrixWorld(true);
}

/**
 * @param {THREE.Object3D} source Moving visual root whose transform is echoed.
 * @param {string} name Helper name.
 * @returns {THREE.Group} A renderless helper root.
 */
function makeRenderlessMotionHelper(source, name) {
  const helper = new THREE.Group();
  helper.name = name;
  if (source?.position) helper.position.copy(source.position);
  if (source?.quaternion) helper.quaternion.copy(source.quaternion);
  Object.assign(helper.userData ||= {}, {
    isMotionHelper: true,
    renderlessHelper: true,
    skipOctree: true,
    noOctree: true,
    addToOctree: false
  });
  return helper;
}

class Chai extends Tzomayach {
  type = "chai";
  rotationSpeed;
  distanceFromRay = 5;
  placementRotation = 0;
  speedScale = 1.4;
  runModeScale = 1;
  walkModeScale = 0.58;
  defaultSpeed = PHYSICS_CONSTANTS.DEFAULT_SPEED;
  rayAnchor = null;
  _speed = this.defaultSpeed;
  _originalSpeed = this._speed;
  _movementSpeed = this._speed;
  jumpHeight = PHYSICS_CONSTANTS.DEFAULT_JUMP_HEIGHT;
  velocity = new THREE.Vector3();
  collider;
  cameraRotation = null;
  offset = 0;
  gotOffset = false;
  lastRotateOffset = 0;
  rotateOffset = 0;
  currentModelVector = new THREE.Vector3();
  worldDirectionVector = new THREE.Vector3();
  worldSideDirectionVector = new THREE.Vector3();
  height = PHYSICS_CONSTANTS.DEFAULT_HEIGHT;
  radius = PHYSICS_CONSTANTS.DEFAULT_RADIUS;
  lerpTurnSpeed = PHYSICS_CONSTANTS.LERP_TURN_SPEED;
  movementResponsiveness = 18;
  stopResponsiveness = 28;
  targetRotateOffset = 0;
  empty;
  modelMesh = null;
  dontRotateMesh = false;
  onFloor = true;
  activeRay = null;
  activeObject = null;
  currentHighlighted = null;
  _isGeneratingGhost = false;
  isPaintingMode = false;
  rays = [];
  spheres = [];
  particles = [];
  moving = { stridingLeft: false, stridingRight: false, forward: false, backward: false, turningLeft: false, turningRight: false, running: true, jump: false };
  movingAutomatically = false;
  isDancing = false;
  chaweeyoosMap = { run: () => this.moving.running ? "run" : "walk", idle: () => this.isDancing ? "dance silly" : "stand", walk: "walk", jump: "jump", falling: "falling", "right turn": "right turn", "left turn": "left turn", "dance silly": "dance silly" };

  get speed() { return this._speed; }
  set speed(v) { this._speed = v; }

  constructor(options = {}, olam) {
    super(options, olam);
    this.rotationSpeed = numberOr(options.rotationSpeed, 2);
    this.heesHawveh = true;
    this.rayAnchor = new THREE.Group();
    this.height = numberOr(options.height, this.height);
    this.radius = numberOr(options.radius, this.radius);
    this.visualGroundBiasY = 0;
    this.lerpTurnSpeed = numberOr(options.lerpTurnSpeed, this.lerpTurnSpeed);
    this.movementResponsiveness = numberOr(options.movementResponsiveness, this.movementResponsiveness);
    this.stopResponsiveness = numberOr(options.stopResponsiveness, this.stopResponsiveness);
    this.animationBlendDuration = numberOr(options.animationBlendDuration, this.animationBlendDuration || 0.075);
    this.animationActionTimeScale = numberOr(options.animationActionTimeScale, this.animationActionTimeScale || 1);
    this.runModeScale = numberOr(options.runModeScale, this.runModeScale);
    this.walkModeScale = numberOr(options.walkModeScale, this.walkModeScale);
    this.dynamicSolidRadius = options.dynamicSolidRadius || options.movingSolidRadius || this.radius * 0.62;
    const start = new THREE.Vector3(0, this.radius, 0);
    const end = new THREE.Vector3(0, Math.max(this.radius, this.height - this.radius), 0);
    this.collider = new Capsule(start, end, this.radius);
    this.collider.nivraReference = this;
    const cm = options.chaweeyoosMap;
    if (cm && typeof cm === "object") Object.keys(cm).forEach(k => { this.chaweeyoosMap[k] = cm[k]; });
    this.on("collider transform update", ({ position, rotation }) => {});
  }

  async heescheel(olam) { await super.heescheel(olam); }
  async afterBriyah() { await super.afterBriyah(this); this.distanceFromRay = 5; }
  async ready() {
    await super.ready();
    if (this.olam) this.olam.scene.add(this.rayAnchor);
    this.speed = this.speed;
    this.animationSpeed = this.speed;
    if (Number.isFinite(Number(this.originalOptions?.animationSpeedScale))) this.animationSpeedScale = Number(this.originalOptions.animationSpeedScale);
    this.empty = new THREE.Group();
    this.empty.name = `${this.name || 'Chai'}_MOVING_VISUAL_ROOT`;
    if (this.olam) this.olam.scene.add(this.empty);
    const pos = this.mesh?.position;
    if (pos) this.empty.position.copy(pos);
    this.modelMesh = this.mesh;
    this.mesh = this.empty;
    bindModelToMovingRoot(this.mesh, this.modelMesh);
    this.emptyCopy = makeRenderlessMotionHelper(this.empty, `${this.name || 'Chai'}_RAYCAST_EMPTY_HELPER`);
    this.nonRotatingEmptyForMovement = makeRenderlessMotionHelper(this.empty, `${this.name || 'Chai'}_MOVEMENT_DIRECTION_HELPER`);
    if (this.olam) this.olam.scene.add(this.emptyCopy);
    this.setPosition(this.mesh.position);
  }
}

ChasveiAwtsmoos.emanate(Chai.prototype, [visualMethods, movementMethods, physicsMethods, raycastingMethods]);
export default Chai;
