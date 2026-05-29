// B"H
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { registerDynamicBody, updateDynamicBody } from "../movers/runtime/dynamicBodyRegistry.js";

const nowSeconds = () => (globalThis.performance?.now?.() || Date.now()) / 1000;
const axisKey = axis => (axis === "y" ? "y" : axis === "z" ? "z" : "x");
const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const component = (source, key, fallback) => finite(source?.[key], fallback);
const material = color => new THREE.MeshBasicMaterial({ color });

/**
 * @file MovingPlatform.js
 * @description Chapter 84: the bridge stamps its motion. The Awtsmoos lets the
 * platform move as one finite decree per frame, then the chossid solver may
 * carry the rider exactly once for that decree. No self-solving. No repeated
 * shove. No hidden `size` theft. Just a small blue floor over lava.
 */
function readVector(source, fallback) {
  return { x: component(source, "x", fallback.x), y: component(source, "y", fallback.y), z: component(source, "z", fallback.z) };
}

function readDimensions(op = {}) {
  const raw = { x: op.width ?? op.dimensions?.x ?? op.size?.x, y: op.height ?? op.dimensions?.y ?? op.size?.y, z: op.depth ?? op.dimensions?.z ?? op.size?.z };
  return { x: Math.max(1, finite(raw.x, 2.5)), y: Math.max(0.75, finite(raw.y, 1)), z: Math.max(1, finite(raw.z, 2.5)) };
}

function vectorIsClean(v) {
  return Number.isFinite(v?.x) && Number.isFinite(v?.y) && Number.isFinite(v?.z);
}

function assertCleanVector(kind, value, context) {
  if (vectorIsClean(value)) return value;
  console.error("B\"H | MOVING_PLATFORM_BAD_VECTOR", { kind, value, context });
  throw new Error(`MovingPlatform ${context?.name || "unnamed"} has invalid ${kind}`);
}

function addBox(group, spec, context) {
  const size = assertCleanVector("box-size", spec.size, { ...context, part: spec.name });
  const position = assertCleanVector("box-position", spec.position, { ...context, part: spec.name });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), spec.material);
  mesh.name = spec.name;
  mesh.position.set(position.x, position.y, position.z);
  mesh.nivraAwtsmoos = group.nivraAwtsmoos;
  mesh.userData = { skipRaycast: true, addToOctree: false, movingPlatformPart: true };
  mesh.frustumCulled = false;
  group.add(mesh);
  return mesh;
}

export default class MovingPlatform extends Domem {
  type = "movingPlatform";
  static itemName = "Moving Platform";
  heesHawveh = true;

  constructor(op = {}, olam) {
    super({ ...op, golem: null, isSolid: false, interactable: false, scale: { x: 1, y: 1, z: 1 } }, olam);
    this.platformOptions = op;
    this.origin = readVector(op.position, { x: 0, y: 0, z: 0 });
    this.dimensions = readDimensions(op);
    this.width = this.dimensions.x;
    this.height = this.dimensions.y;
    this.depth = this.dimensions.z;
    this.axis = axisKey(op.axis);
    this.distance = Math.max(0, finite(op.distance ?? op.amplitude, 4));
    this.speed = Math.max(0, finite(op.moveSpeed ?? op.speed, 1));
    this.phase = finite(op.phase, 0);
    this.motionTick = 0;
    this.halfExtents = new THREE.Vector3(this.dimensions.x / 2, this.dimensions.y / 2, this.dimensions.z / 2);
    this.dynamicBody = null;
    this.log("constructed", { raw: { width: op.width, height: op.height, depth: op.depth, size: op.size, dimensions: op.dimensions }, dimensions: this.dimensions, loaderSizeField: this.size });
  }

  async heescheel(olam) {
    this.olam = olam;
    this.log("heescheel:start", { loaderSizeField: this.size, dimensions: this.dimensions });
    this.mesh = this.makeMesh();
    this.dynamicBody = this.makeDynamicBody();
    registerDynamicBody(olam, this.dynamicBody);
    await olam.hoyseef(this);
    this.isReady = true;
    this.reportSizeTruth();
  }

  makeMesh() {
    assertCleanVector("dimensions", this.dimensions, { name: this.name });
    assertCleanVector("origin", this.origin, { name: this.name });
    const group = new THREE.Group();
    group.name = `${this.name || "MovingPlatform"}_${this.dimensions.x}x${this.dimensions.y}x${this.dimensions.z}`;
    group.nivraAwtsmoos = this;
    group.position.set(this.origin.x, this.origin.y, this.origin.z);
    group.userData = { skipRaycast: true, addToOctree: false, isSolid: false, dynamicDimensions: { ...this.dimensions } };
    this.addVisualDeck(group);
    group.updateMatrixWorld(true);
    return group;
  }

  addVisualDeck(group) {
    const d = this.dimensions;
    const top = d.y / 2 + 0.025;
    const deck = material(0x26b6ff);
    const rail = material(0x9eeaff);
    const mark = material(0x004d88);
    const context = { name: this.name, dimensions: d, loaderSizeField: this.size };
    addBox(group, { name: "deck", size: d, position: { x: 0, y: 0, z: 0 }, material: deck }, context);
    addBox(group, { name: "front_rail", size: { x: d.x + 0.04, y: 0.045, z: 0.055 }, position: { x: 0, y: top, z: -d.z / 2 }, material: rail }, context);
    addBox(group, { name: "back_rail", size: { x: d.x + 0.04, y: 0.045, z: 0.055 }, position: { x: 0, y: top, z: d.z / 2 }, material: rail }, context);
    addBox(group, { name: "left_rail", size: { x: 0.055, y: 0.045, z: d.z + 0.04 }, position: { x: -d.x / 2, y: top, z: 0 }, material: rail }, context);
    addBox(group, { name: "right_rail", size: { x: 0.055, y: 0.045, z: d.z + 0.04 }, position: { x: d.x / 2, y: top, z: 0 }, material: rail }, context);
    for (let z = -1; z <= 1; z += 1) addBox(group, { name: `rib_z_${z}`, size: { x: d.x, y: 0.025, z: 0.03 }, position: { x: 0, y: top + 0.03, z: z * d.z / 4 }, material: mark }, context);
    for (let x = -1; x <= 1; x += 1) addBox(group, { name: `rib_x_${x}`, size: { x: 0.03, y: 0.025, z: d.z }, position: { x: x * d.x / 4, y: top + 0.055, z: 0 }, material: mark }, context);
  }

  makeDynamicBody() {
    const position = this.mesh.position.clone();
    return { id: this.name || "movingPlatform", type: "movingBlock", role: "movingPlatform", owner: this, motionTick: this.motionTick, position: position.clone(), previousPosition: position.clone(), velocity: new THREE.Vector3(), halfExtents: this.halfExtents.clone(), pathBox: this.makePathBox(), enableCrush: false, carriesPlayer: true };
  }

  makePathBox() {
    const reachX = this.axis === "x" ? this.distance : 0;
    const reachZ = this.axis === "z" ? this.distance : 0;
    return { minX: this.origin.x - this.halfExtents.x - reachX - 2, maxX: this.origin.x + this.halfExtents.x + reachX + 2, minZ: this.origin.z - this.halfExtents.z - reachZ - 2, maxZ: this.origin.z + this.halfExtents.z + reachZ + 2 };
  }

  heesHawvoos() {
    if (!this.mesh || !this.dynamicBody) return;
    const previous = this.dynamicBody.position.clone();
    const offset = Math.sin(nowSeconds() * this.speed + this.phase) * this.distance;
    this.mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
    this.mesh.position[this.axis] += offset;
    this.mesh.updateMatrixWorld(true);
    this.motionTick += 1;
    updateDynamicBody(this.dynamicBody, this.mesh.position, previous);
    this.dynamicBody.motionTick = this.motionTick;
  }

  reportSizeTruth() {
    const box = new THREE.Box3().setFromObject(this.mesh);
    const measured = new THREE.Vector3();
    box.getSize(measured);
    this.log("size-truth", { authored: this.dimensions, measured: { x: measured.x, y: measured.y, z: measured.z }, children: this.mesh.children.length, loaderSizeField: this.size });
  }

  log(stage, payload) {
    console.info("B\"H | MOVING_PLATFORM_TRACE", { stage, name: this.name, ...payload });
  }
}
