// B"H
import {
	Box3,
	Line3,
	Plane,
	Sphere,
	Triangle,
	Vector3
} from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { Capsule } from '../Capsule.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import build from "./methods/build.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import intersection from "./methods/intersection.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

// --- Reusable private variables ---
const _v1 = new Vector3();
const _v2 = new Vector3();
const _plane = new Plane();
const _line1 = new Line3();
const _line2 = new Line3();
const _temp_triangle = new Triangle();

const MAX_DEPTH = 55;

export class Octree {
	// Holds Triangle objects until the build is triggered.
	// Kept permanently to allow for reliable removals and rebuilds.
	allTriangles;
	
	// The memory-optimized flat array, derived from allTriangles.
	worldTrianglesData;

	// Flag to control the "Just-in-Time" build.
	isBuilt;

	constructor(box) {
		this.triangles = []; // This will store triangle INDICES
		this.box = box || new Box3();
		this.subTrees = [];
		this.allTriangles = [];
		this.isBuilt = false;
		this.dynamicTriangles = [];
		Object.keys(build).forEach(q => {
			this[q] = build[q].bind(this);
		})
		Object.keys(intersection).forEach(q => {
			this[q] = intersection[q].bind(this);
		})
	}
	
	
	
	/**
	 * B"H
	 *  Resets the octree to a clean state without needing to create a new instance.
	 * This is critical for the performance of the dynamic OctreeWorld, which rebuilds
	 * chunk physics frequently.
	 */
	clear() {
	    this.allTriangles.length = 0;
	    this.worldTrianglesData = null; // Let garbage collector handle the old Float32Array
	    this.triangles.length = 0;
	    this.subTrees.length = 0;
	    this.box.makeEmpty();
	    this.isBuilt = false;
	    this._isManaged = false; // When cleared, it reverts to a normal, unmanaged octree.

	    return this; // Allow chaining
	}
	
	
	
	
	
}