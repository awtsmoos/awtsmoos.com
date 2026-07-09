// B"H
/**
 * @file MovingPushBlock.js
 * @description Chapter 57: The stone stops pretending to be scenery. The
 * Awtsmoos breathes previousPosition, position, velocity, and halfExtents into
 * it, and the player is shoved by law instead of swallowed by accident.
 */
import Domem from "../../chayim/domem/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { registerDynamicBody, updateDynamicBody } from "./runtime/dynamicBodyRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { solveMovingSolid } from "./runtime/movingSolidSolver.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const nowSeconds = () => (globalThis.performance?.now?.() || Date.now()) / 1000;

/**
 * Creates a tiny procedural block texture.
 * @returns {THREE.DataTexture} Warm block texture, generated locally.
 */
function makeBlockTexture() {
  const size = 32;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const i = (y * size + x) * 4;
    const mortar = x % 8 === 0 || y % 8 === 0;
    const chip = (x * 11 + y * 17) & 31;
    data[i] = mortar ? 224 : 170 + chip;
    data[i + 1] = mortar ? 206 : 145 + (chip >> 1);
    data[i + 2] = mortar ? 135 : 82 + (chip >> 2);
    data[i + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.wrapS = THREE.MirroredRepeatWrapping;
  tex.wrapT = THREE.MirroredRepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.repeat.set(2, 2);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Runtime moving block: not octree, not raycast, not mesh collision.
 */
export default class MovingPushBlock extends Domem {
  type = "movingPushBlock";
  heesHawveh = true;

  /**
   * @param {object} op Authored mover config.
   * @param {object} olam Runtime world.
   */
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.origin = { ...(op.position || { x: 0, y: 0, z: 0 }) };
    this.size = op.size || { x: 3, y: 2.2, z: 1.35 };
    this.axis = op.axis || "z";
    this.amplitude = Number(op.amplitude || 2.8);
    this.speed = Number(op.speed || 1);
    this.halfExtents = new THREE.Vector3(this.size.x / 2, this.size.y / 2, this.size.z / 2);
    this.pathBox = this.makePathBox();
    this.dynamicBody = null;
  }

  /** @param {object} olam Runtime world. @returns {Promise<void>} */
  async heescheel(olam) {
    this.olam = olam;
    this.mesh = this.makeMesh();
    this.dynamicBody = this.makeDynamicBody();
    registerDynamicBody(olam, this.dynamicBody);
    await olam.hoyseef(this);
    this.isReady = true;
  }

  /** @returns {THREE.Mesh} Visual mesh, marked out of static collision systems. */
  makeMesh() {
    const geo = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z, 1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ map: makeBlockTexture(), color: 0xe3c97f });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = this.name || "MovingPushBlock";
    mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
    mesh.userData.skipRaycast = true;
    mesh.userData.addToOctree = false;
    return mesh;
  }

  /** @returns {object} The required lightweight runtime body. */
  makeDynamicBody() {
    const position = this.mesh.position.clone();
    return {
      type: "movingBlock",
      owner: this,
      position: position.clone(),
      previousPosition: position.clone(),
      velocity: new THREE.Vector3(),
      halfExtents: this.halfExtents.clone(),
      pathBox: this.pathBox,
      resetPosition: new THREE.Vector3(0, 10, 0)
    };
  }

  /** @returns {{minX:number,maxX:number,minZ:number,maxZ:number}} Whole route broadphase. */
  makePathBox() {
    const reachX = this.axis === "x" ? this.amplitude : 0;
    const reachZ = this.axis === "z" ? this.amplitude : 0;
    return {
      minX: this.origin.x - this.size.x / 2 - reachX,
      maxX: this.origin.x + this.size.x / 2 + reachX,
      minZ: this.origin.z - this.size.z / 2 - reachZ,
      maxZ: this.origin.z + this.size.z / 2 + reachZ
    };
  }

  /** @returns {void} Moves the body, refreshes runtime data, then solves player collision. */
  heesHawvoos() {
    if (!this.mesh || !this.dynamicBody) return;
    const previous = this.dynamicBody.position.clone();
    const offset = Math.sin(nowSeconds() * this.speed) * this.amplitude;
    this.mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
    this.mesh.position[this.axis] += offset;
    updateDynamicBody(this.dynamicBody, this.mesh.position, previous);
    solveMovingSolid(this.dynamicBody, this.olam?.chossid);
  }
}
