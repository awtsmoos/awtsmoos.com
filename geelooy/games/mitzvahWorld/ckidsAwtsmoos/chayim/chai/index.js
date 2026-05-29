// B"H
/**
 * @file index.js
 * @description Chapter 63: the Chai body drinks the fresh physics wrapper, not
 * the stale cached stream. The Awtsmoos grafts visual, movement, physics, and
 * raycasting limbs onto one living prototype.
 */
import Tzomayach from "../tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';
import { Capsule } from '../../Olam/math/Capsule.js';
import visualMethods from "./methods/visuals.js";
import movementMethods from "./methods/movement.js";
import physicsMethods from "./methods/physics.js?v=lean-l1-20260528-bh63";
import raycastingMethods from "./methods/raycasting.js";
import { PHYSICS_CONSTANTS } from "./methods/physics/physicsConstants.js";
import ChasveiAwtsmoos from '../../utils/ChasveiAwtsmoos.js';

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

  /** @param {object} options Entity options. @param {object} olam Runtime world. */
  constructor(options = {}, olam) {
    super(options, olam);
    this.rotationSpeed = options.rotationSpeed || 2;
    this.heesHawveh = true;
    this.rayAnchor = new THREE.Group();
    this.height = options.height || this.height;
    this.radius = options.radius || this.radius;
    this.dynamicSolidRadius = options.dynamicSolidRadius || options.movingSolidRadius || this.radius * 0.62;
    this.collider = new Capsule(new THREE.Vector3(0, this.height, 0), new THREE.Vector3(0, this.height, 0), this.radius);
    this.collider.nivraReference = this;
    const cm = options.chaweeyoosMap;
    if (cm && typeof cm === "object") Object.keys(cm).forEach(k => { this.chaweeyoosMap[k] = cm[k]; });
    this.on("collider transform update", ({ position, rotation }) => {});
  }

  /** @param {object} olam Runtime world. */
  async heescheel(olam) { await super.heescheel(olam); }
  async afterBriyah() { await super.afterBriyah(this); this.distanceFromRay = 5; }

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
