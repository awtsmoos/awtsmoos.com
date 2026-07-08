// B"H
/** @file index.js @description Stable split Octree based on the old Three.js collision covenant. */
import { Box3, Layers } from '/games/scripts/build/three.module.js?compact=true&v=stable-three-octree-20260708-bh3';
import build from "./methods/build.js?compact=true&v=stable-three-octree-20260708-bh3";
import intersection from "./methods/intersection.js?compact=true&v=stable-three-octree-20260708-bh3";
export class Octree {
  constructor(box) {
    this.box = box || new Box3();
    this.bounds = new Box3();
    this.layers = new Layers();
    this.trianglesPerLeaf = 8;
    this.maxLevel = 16;
    this.subTrees = [];
    this.triangles = [];
    this.allTriangles = [];
    this.dynamicTriangles = [];
    this.isBuilt = false;
    Object.assign(this, build, intersection);
  }
  clear() { this.box = new Box3(); this.bounds.makeEmpty(); this.subTrees.length = 0; this.triangles.length = 0; this.allTriangles.length = 0; this.dynamicTriangles.length = 0; this.isBuilt = false; this._isManaged = false; return this; }
}
export default Octree;
