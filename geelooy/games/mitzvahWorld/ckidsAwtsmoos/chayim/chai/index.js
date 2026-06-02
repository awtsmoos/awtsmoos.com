// B"H
/**
 * @file index.js
 * @description
 * Chapter 39: The Chai Received Tunable Breath.
 *
 * The Awtsmoos gives the player a feet-based capsule, a measured visual robe,
 * smoothed horizontal motion, and level-authored turning knobs. Nothing about
 * the GLB can mutate the collider; movement is practical, responsive, and calm.
 */
import Tzomayach from "../tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';
import { Capsule } from '../../Olam/math/Capsule.js';
import visualMethods from "./methods/visuals.js?v=measured-visual-lift-20260602-bh6";
import movementMethods from "./methods/movement.js";
import physicsMethods from "./methods/physics.js?v=smooth-velocity-turn-20260602-bh9";
import raycastingMethods from "./methods/raycasting.js";
import { PHYSICS_CONSTANTS } from "./methods/physics/physicsConstants.js";
import ChasveiAwtsmoos from '../../utils/ChasveiAwtsmoos.js';

const numberOr = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export default class Chai extends Tzomayach {
  type = "chai";
  rotationSpeed;
  distanceFromRay = 5;
  placementRotation = 0;
  speedScale = 1.4;
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
  moving = { stridingLeft: false, stridingRight: false, forward: false, backward: false, turningLeft: false, turningRight: false, running: false, jump: false };
  movingAutomatically = false;
  isDancing = false;
  chaweeyoosMap = {
    run: () => this.moving.running ? "run" : "walk",
    idle: () => this.isDancing ? "dance silly" : "stand",
    walk: "walk",
    jump: "jump",
    falling: "falling",
    "right turn": "right turn",
    "left turn": "left turn",
    "dance silly": "dance silly"
  };

  get speed() { return this._speed; }
  set speed(v) { this._speed = v; }

  /** @param {object} options Entity options from level JSON. @param {object} olam Runtime world. */
  constructor(options = {}, olam) {
    super(options, olam);
    this.rotationSpeed = numberOr(options.rotationSpeed, 2);
    this.heesHawveh = true;
    this.rayAnchor = new THREE.Group();
    this.height = numberOr(options.height, this.height);
    this.radius = numberOr(options.radius, this.radius);
    this.visualGroundBiasY = numberOr(options.visualGroundBiasY, 0);
    this.lerpTurnSpeed = numberOr(options.lerpTurnSpeed, this.lerpTurnSpeed);
    this.movementResponsiveness = numberOr(options.movementResponsiveness, this.movementResponsiveness);
    this.stopResponsiveness = numberOr(options.stopResponsiveness, this.stopResponsiveness);
    this.dynamicSolidRadius = options.dynamicSolidRadius || options.movingSolidRadius || this.radius * 0.62;
    const start = new THREE.Vector3(0, this.radius, 0);
    const end = new THREE.Vector3(0, Math.max(this.radius, this.height - this.radius), 0);
    this.collider = new Capsule(start, end, this.radius);
    this.collider.nivraReference = this;
    const cm = options.chaweeyoosMap;
    if (cm && typeof cm === "object") Object.keys(cm).forEach(k => { this.chaweeyoosMap[k] = cm[k]; });
    this.on("collider transform update", ({ position, rotation }) => {});
  }

  /** @param {object} olam Runtime world. */
  async heescheel(olam) { await super.heescheel(olam); }

  /** @returns {Promise<void>} */
  async afterBriyah() { await super.afterBriyah(this); this.distanceFromRay = 5; }

  /** @returns {Promise<void>} */
  async ready() {
    await super.ready();
    if (this.olam) this.olam.scene.add(this.rayAnchor);
    this.speed = this.speed;
    this.animationSpeed = this.speed;
    this.empty = new THREE.Group();
    if (this.olam) this.olam.scene.add(this.empty);
    const pos = this.mesh?.position;
    if (pos) this.empty.position.copy(pos);
    this.modelMesh = this.mesh;
    this.mesh = this.empty;
    this.emptyCopy = this.empty.clone();
    this.nonRotatingEmptyForMovement = this.empty.clone();
    if (this.olam) this.olam.scene.add(this.emptyCopy);
    this.setPosition(this.mesh.position);
  }
}

ChasveiAwtsmoos.emanate(Chai.prototype, [visualMethods, movementMethods, physicsMethods, raycastingMethods]);
