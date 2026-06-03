// B"H
/**
 * @file MovingPlatform.js
 * @description
 * Chapter 211: The bridge may be true, false, or disguised as fire.
 *
 * The Awtsmoos now permits hard teaching levels: a blue-looking platform can be
 * fake and let the chossid fall through, while a lava-globe-looking platform can
 * secretly be the only true moving floor. The body registry only receives real
 * platforms; fake ones are visual-only with identical proportions.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { registerDynamicBody, updateDynamicBody } from "../movers/runtime/dynamicBodyRegistry.js";

const nowSeconds = () => (globalThis.performance?.now?.() || Date.now()) / 1000;
const axisKey = axis => (axis === "y" ? "y" : axis === "z" ? "z" : "x");
const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const component = (source, key, fallback) => finite(source?.[key], fallback);

function texture(color, mode = "blue") {
  const size = 48, data = new Uint8Array(size * size * 4);
  const base = [(color >> 16) & 255, (color >> 8) & 255, color & 255];
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const i = (y * size + x) * 4;
    const rib = mode === "lava" ? (Math.sin(x * 0.4) + Math.cos(y * 0.37) > 1.1 ? 75 : -18) : (x % 12 < 2 || y % 12 < 2 ? -52 : 18);
    data[i] = Math.max(0, Math.min(255, base[0] + rib));
    data[i + 1] = Math.max(0, Math.min(255, base[1] + rib * 0.5));
    data[i + 2] = Math.max(0, Math.min(255, base[2] + rib * 0.25));
    data[i + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter;
  tex.repeat.set(2.4, 2.4); tex.needsUpdate = true;
  return tex;
}

function material(color, mode) {
  return new THREE.MeshLambertMaterial({ color: 0xffffff, map: texture(color, mode), emissive: mode === "lava" ? 0x421300 : 0x001122, emissiveIntensity: mode === "lava" ? 0.34 : 0.08 });
}

function readVector(source, fallback) {
  return { x: component(source, "x", fallback.x), y: component(source, "y", fallback.y), z: component(source, "z", fallback.z) };
}

function readDimensions(op = {}) {
  const raw = { x: op.width ?? op.dimensions?.x ?? op.size?.x, y: op.height ?? op.dimensions?.y ?? op.size?.y, z: op.depth ?? op.dimensions?.z ?? op.size?.z };
  return { x: Math.max(1, finite(raw.x, 2.5)), y: Math.max(0.35, finite(raw.y, 0.8)), z: Math.max(1, finite(raw.z, 2.5)) };
}

function addBox(group, spec, owner) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(spec.size.x, spec.size.y, spec.size.z), spec.material);
  mesh.name = spec.name; mesh.position.set(spec.position.x, spec.position.y, spec.position.z);
  mesh.nivraAwtsmoos = owner;
  mesh.userData = { skipRaycast: true, addToOctree: false, skipOctree: true, noOctree: true, movingPlatformPart: true, fakePlatform: owner.isFake };
  mesh.frustumCulled = false; group.add(mesh); return mesh;
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
    this.width = this.dimensions.x; this.height = this.dimensions.y; this.depth = this.dimensions.z;
    this.axis = axisKey(op.axis); this.distance = Math.max(0, finite(op.distance ?? op.amplitude, 4));
    this.speed = Math.max(0, finite(op.moveSpeed ?? op.speed, 1)); this.phase = finite(op.phase, 0);
    this.visualStyle = op.visualStyle || op.disguise || "bluePlatform";
    this.isFake = Boolean(op.fake || op.passThrough || op.isFake);
    this.carriesPlayer = op.carriesPlayer !== false && !this.isFake;
    this.motionTick = 0;
    this.halfExtents = new THREE.Vector3(this.dimensions.x / 2, this.dimensions.y / 2, this.dimensions.z / 2);
    this.dynamicBody = null;
  }

  async heescheel(olam) {
    this.olam = olam;
    this.mesh = this.makeMesh();
    if (!this.isFake) { this.dynamicBody = this.makeDynamicBody(); registerDynamicBody(olam, this.dynamicBody); }
    await olam.hoyseef(this);
    this.isReady = true;
  }

  makeMesh() {
    const group = new THREE.Group();
    group.name = `${this.name || "MovingPlatform"}_${this.isFake ? "FAKE" : "REAL"}`;
    group.nivraAwtsmoos = this;
    group.position.set(this.origin.x, this.origin.y, this.origin.z);
    group.userData = { skipRaycast: true, addToOctree: false, skipOctree: true, noOctree: true, isSolid: false, fakePlatform: this.isFake };
    this.visualStyle === "lavaOrbPlatform" ? this.addLavaDisguise(group) : this.addVisualDeck(group);
    group.updateMatrixWorld(true);
    return group;
  }

  addVisualDeck(group) {
    const d = this.dimensions, top = d.y / 2 + 0.025, deck = material(0x26b6ff, "blue"), rail = material(0x9eeaff, "blue"), mark = material(0x004d88, "blue");
    addBox(group, { name: "deck", size: d, position: { x: 0, y: 0, z: 0 }, material: deck }, this);
    addBox(group, { name: "front_rail", size: { x: d.x + 0.04, y: 0.045, z: 0.055 }, position: { x: 0, y: top, z: -d.z / 2 }, material: rail }, this);
    addBox(group, { name: "back_rail", size: { x: d.x + 0.04, y: 0.045, z: 0.055 }, position: { x: 0, y: top, z: d.z / 2 }, material: rail }, this);
    addBox(group, { name: "left_rail", size: { x: 0.055, y: 0.045, z: d.z + 0.04 }, position: { x: -d.x / 2, y: top, z: 0 }, material: rail }, this);
    addBox(group, { name: "right_rail", size: { x: 0.055, y: 0.045, z: d.z + 0.04 }, position: { x: d.x / 2, y: top, z: 0 }, material: rail }, this);
    for (let z = -1; z <= 1; z += 1) addBox(group, { name: `rib_z_${z}`, size: { x: d.x, y: 0.025, z: 0.03 }, position: { x: 0, y: top + 0.03, z: z * d.z / 4 }, material: mark }, this);
  }

  addLavaDisguise(group) {
    const d = this.dimensions, mat = material(0x9a3517, "lava");
    addBox(group, { name: "secret_flat_core", size: d, position: { x: 0, y: 0, z: 0 }, material: mat }, this);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(Math.max(d.x, d.z) * 0.44, 20, 12), mat);
    globe.name = "lava_ball_shell_that_is_secretly_safe"; globe.position.y = d.y * 0.42; globe.nivraAwtsmoos = this;
    globe.userData = { skipRaycast: true, skipOctree: true, noOctree: true, addToOctree: false, lavaDisguisePlatform: true };
    group.add(globe);
    const glow = new THREE.PointLight(0xff6a22, 0.55, 5.2, 2); glow.name = "safe_lava_disguise_glow"; group.add(glow);
  }

  makeDynamicBody() {
    const position = this.mesh.position.clone();
    return { id: this.name || "movingPlatform", type: "movingBlock", role: "movingPlatform", owner: this, motionTick: this.motionTick, position: position.clone(), previousPosition: position.clone(), velocity: new THREE.Vector3(), halfExtents: this.halfExtents.clone(), pathBox: this.makePathBox(), enableCrush: false, carriesPlayer: this.carriesPlayer };
  }

  makePathBox() {
    const reachX = this.axis === "x" ? this.distance : 0, reachZ = this.axis === "z" ? this.distance : 0;
    return { minX: this.origin.x - this.halfExtents.x - reachX - 2, maxX: this.origin.x + this.halfExtents.x + reachX + 2, minZ: this.origin.z - this.halfExtents.z - reachZ - 2, maxZ: this.origin.z + this.halfExtents.z + reachZ + 2 };
  }

  heesHawvoos() {
    if (!this.mesh) return;
    const previous = this.dynamicBody?.position?.clone?.() || this.mesh.position.clone();
    const offset = Math.sin(nowSeconds() * this.speed + this.phase) * this.distance;
    this.mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
    this.mesh.position[this.axis] += offset;
    this.mesh.rotation.y += this.visualStyle === "lavaOrbPlatform" ? 0.012 : 0;
    this.mesh.updateMatrixWorld(true);
    if (!this.dynamicBody) return;
    this.motionTick += 1; updateDynamicBody(this.dynamicBody, this.mesh.position, previous); this.dynamicBody.motionTick = this.motionTick;
  }
}
