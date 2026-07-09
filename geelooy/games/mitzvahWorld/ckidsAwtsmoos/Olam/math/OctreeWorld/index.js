// B"H
/**
 * @module OctreeWorld
 * @description
 * Chapter 150: The collision temple imports the world-pose insertion vessel.
 * The house/fence fix lives inside methods/index.js, so this root module must
 * cache-bust that hub or Android can keep old non-solid wall physics.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import JobProcessor from './JobProcessor.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import methods from './methods/index.js?compact=true&v=world-pose-collider-clones-20260605-bh448';

export class OctreeWorld {
  constructor() {
    this.root = null;
    this._intakeQueue = [];
    this._buildQueue = new Set();
    this._subdivisionQueue = new Set();
    this._mergeQueue = new Set();
    this._pendingOctrees = [];
    this._lastUpdateCenter = new THREE.Vector3(Infinity, Infinity, Infinity);
    this.jobProcessor = new JobProcessor(this);
    Object.keys(methods).forEach(methodName => { this[methodName] = methods[methodName].bind(this); });
  }
}
