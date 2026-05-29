// B"H
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { registerDynamicBody, updateDynamicBody } from "../movers/runtime/dynamicBodyRegistry.js";
import { solveMovingSolid } from "../movers/runtime/movingSolidSolver.js";

/**
 * @file MovingPlatform.js
 * @description Chapter 71: The blue bridge crossed the lava and discovered
 * its own name had been carved with undefined letters. The Awtsmoos answered
 * by giving every authored dimension a finite vessel before it could touch a
 * matrix. Geometry now carries the width, height, and depth directly; scale is
 * kept pure 1x1x1 so no NaN can crawl upward into the parent world transform.
 */
const nowSeconds = () => (globalThis.performance?.now?.() || Date.now()) / 1000;
const finite = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const axisKey = axis => (axis === "y" ? "y" : axis === "z" ? "z" : "x");

/** @returns {THREE.DataTexture} A tiny blue grid, a river frozen into mitzvah stone. */
function makeBlueTexture() {
  const size = 32;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const i = (y * size + x) * 4;
    const seam = x % 8 === 0 || y % 8 === 0;
    const spark = (x * 13 + y * 29) & 31;
    data[i] = seam ? 36 : 34 + spark;
    data[i + 1] = seam ? 190 : 145 + spark;
    data[i + 2] = seam ? 255 : 218 + (spark >> 1);
    data[i + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter;
  tex.repeat.set(3, 2); tex.needsUpdate = true;
  return tex;
}

export default class MovingPlatform extends Domem {
  type = "movingPlatform";
  static itemName = "Finite Dynamic Moving Platform";
  heesHawveh = true;

  /**
   * @param {object} op Authored platform config from level JSON.
   * @param {object} olam Runtime world that receives the moving bridge.
   */
  constructor(op = {}, olam) {
    super({ ...op, golem: null, isSolid: false, interactable: false, scale: { x: 1, y: 1, z: 1 } }, olam);
    this.origin = this.readVector(op.position, { x: 0, y: 0, z: 0 });
    this.size = this.readSize(op);
    this.width = this.size.x; this.height = this.size.y; this.depth = this.size.z;
    this.axis = axisKey(op.axis);
    this.distance = Math.max(0, finite(op.distance ?? op.amplitude, 4));
    this.speed = Math.max(0, finite(op.moveSpeed ?? op.speed, 1));
    this.phase = finite(op.phase, 0);
    this.halfExtents = new THREE.Vector3(this.size.x / 2, this.size.y / 2, this.size.z / 2);
    this.dynamicBody = null;
  }

  /** @param {object} source Possible vector-like object. @param {object} fallback Safe vector. @returns {{x:number,y:number,z:number}} */
  readVector(source, fallback) {
    return { x: finite(source?.x, fallback.x), y: finite(source?.y, fallback.y), z: finite(source?.z, fallback.z) };
  }

  /** @param {object} op Options. @returns {{x:number,y:number,z:number}} Finite platform dimensions. */
  readSize(op) {
    const raw = {
      x: op.width ?? op.dimensions?.x ?? op.size?.x,
      y: op.height ?? op.dimensions?.y ?? op.size?.y,
      z: op.depth ?? op.dimensions?.z ?? op.size?.z
    };
    return {
      x: Math.max(2.4, finite(raw.x, 5.2)),
      y: Math.max(0.75, finite(raw.y, 0.85)),
      z: Math.max(2.0, finite(raw.z, 3.1))
    };
  }

  /** @param {object} olam Runtime world. @returns {Promise<void>} Adds mesh and dynamic body. */
  async heescheel(olam) {
    this.olam = olam;
    this.mesh = this.makeMesh();
    this.dynamicBody = this.makeDynamicBody();
    registerDynamicBody(olam, this.dynamicBody);
    await olam.hoyseef(this);
    this.isReady = true;
  }

  /** @returns {THREE.Mesh} Finite geometry with clean unit scale. */
  makeMesh() {
    const geometry = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z, 1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ map: makeBlueTexture(), color: 0x4fc3ff });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `${this.name || "DynamicMovingPlatform"}_${this.size.x}x${this.size.y}x${this.size.z}`;
    mesh.nivraAwtsmoos = this;
    mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
    mesh.scale.set(1, 1, 1);
    mesh.userData = { skipRaycast: true, addToOctree: false, isSolid: false, dynamicSize: { ...this.size } };
    mesh.frustumCulled = false;
    mesh.updateMatrixWorld(true);
    return mesh;
  }

  /** @returns {object} Dynamic collision descriptor for the moving-solid solver. */
  makeDynamicBody() {
    const position = this.mesh.position.clone();
    return { type: "movingPlatform", owner: this, position: position.clone(), previousPosition: position.clone(), velocity: new THREE.Vector3(), halfExtents: this.halfExtents.clone(), pathBox: this.makePathBox(), enableCrush: false, carriesPlayer: true };
  }

  /** @returns {{minX:number,maxX:number,minZ:number,maxZ:number}} Broadphase path box. */
  makePathBox() {
    const reachX = this.axis === "x" ? this.distance : 0;
    const reachZ = this.axis === "z" ? this.distance : 0;
    return { minX: this.origin.x - this.halfExtents.x - reachX - 1.5, maxX: this.origin.x + this.halfExtents.x + reachX + 1.5, minZ: this.origin.z - this.halfExtents.z - reachZ - 1.5, maxZ: this.origin.z + this.halfExtents.z + reachZ + 1.5 };
  }

  /** @returns {void} Moves the bridge and keeps transforms finite each frame. */
  heesHawvoos() {
    if (!this.mesh || !this.dynamicBody) return;
    const previous = this.dynamicBody.position.clone();
    const offset = Math.sin(nowSeconds() * this.speed + this.phase) * this.distance;
    this.mesh.position.set(this.origin.x, this.origin.y, this.origin.z);
    this.mesh.position[this.axis] += offset;
    this.mesh.scale.set(1, 1, 1);
    this.mesh.updateMatrixWorld(true);
    updateDynamicBody(this.dynamicBody, this.mesh.position, previous);
    solveMovingSolid(this.dynamicBody, this.olam?.chossid);
  }
}
