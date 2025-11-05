// B"H
import {
	Box3,
	Line3,
	Plane,
	Sphere,
	Triangle,
	Vector3
} from '/games/scripts/build/three.module.js';
import { Capsule } from '../math/Capsule.js';

// --- Reusable private variables ---
const _v1 = new Vector3();
const _v2 = new Vector3();
const _plane = new Plane();
const _line1 = new Line3();
const _line2 = new Line3();
const _sphere = new Sphere();
const _capsule = new Capsule();
const _temp_triangle = new Triangle();

const MAX_DEPTH = 55;

export class Octree {
	// Holds the definitive list of ALL triangles from ALL meshes added.
	// This is a list of Triangle objects, used only for rebuilding.
	#allTriangles;
	
	// The memory-optimized flat array of vertex data. This is what's
	// used for all collision checks after the build is complete.
	#worldTrianglesData;

	// Flag to control the "Just-In-Time" build.
	#isBuilt;

	constructor(box) {
		this.triangles = []; // This will store triangle INDICES
		this.box = box || new Box3();
		this.subTrees = [];
		this.#allTriangles = [];
		this.#isBuilt = false;
	}

	fromGraphNode(group) {
		group.updateWorldMatrix(true, true);

		group.traverse((obj) => {
			if (obj.isMesh === true) {
				let geometry, isTemp = false;
				if (obj.geometry.index !== null) {
					isTemp = true;
					geometry = obj.geometry.toNonIndexed();
				} else {
					geometry = obj.geometry;
				}

				const positionAttribute = geometry.getAttribute('position');
				for (let i = 0; i < positionAttribute.count; i += 3) {
					const v1 = new Vector3().fromBufferAttribute(positionAttribute, i);
					const v2 = new Vector3().fromBufferAttribute(positionAttribute, i + 1);
					const v3 = new Vector3().fromBufferAttribute(positionAttribute, i + 2);

					v1.applyMatrix4(obj.matrixWorld);
					v2.applyMatrix4(obj.matrixWorld);
					v3.applyMatrix4(obj.matrixWorld);
					
					this.#allTriangles.push(new Triangle(v1, v2, v3));
				}

				if (isTemp) {
					geometry.dispose();
				}
			}
		});

		// CRITICAL: We DO NOT build here. We just mark the octree as needing a build.
		this.#isBuilt = false;

		return this;
	}

	build() {
		// 1. Create the optimized flat data array from the master list
		this.#worldTrianglesData = new Float32Array(this.#allTriangles.length * 9);
		for (let i = 0; i < this.#allTriangles.length; i++) {
			const tri = this.#allTriangles[i];
			const baseIndex = i * 9;
			this.#worldTrianglesData[baseIndex] = tri.a.x;
			this.#worldTrianglesData[baseIndex + 1] = tri.a.y;
			this.#worldTrianglesData[baseIndex + 2] = tri.a.z;
			this.#worldTrianglesData[baseIndex + 3] = tri.b.x;
			this.#worldTrianglesData[baseIndex + 4] = tri.b.y;
			this.#worldTrianglesData[baseIndex + 5] = tri.b.z;
			this.#worldTrianglesData[baseIndex + 6] = tri.c.x;
			this.#worldTrianglesData[baseIndex + 7] = tri.c.y;
			this.#worldTrianglesData[baseIndex + 8] = tri.c.z;
		}
		
		// 2. Build the octree structure using this new flat data
		this.calcBox();
		this.split(0);
		
		// 3. Mark as built and clear the temporary triangle array to save memory
		this.#isBuilt = true;
		this.#allTriangles = []; // Release memory

		return this;
	}
	
	calcBox() {
		const triangleCount = this.#getTriangleCount();
		this.triangles = Array.from(Array(triangleCount).keys());
		
		this.box.makeEmpty();
		for (let i = 0; i < triangleCount; i++) {
			const tri = this.#_getTriangle(i, _temp_triangle);
			this.box.expandByPoint(tri.a);
			this.box.expandByPoint(tri.b);
			this.box.expandByPoint(tri.c);
		}

		this.box.min.x -= 0.01;
		this.box.min.y -= 0.01;
		this.box.min.z -= 0.01;
	}

	split(level) {
		this.subTrees = [];
		const subTrees = [];
		const halfsize = _v2.copy(this.box.max).sub(this.box.min).multiplyScalar(0.5);

		for (let x = 0; x < 2; x++) { for (let y = 0; y < 2; y++) { for (let z = 0; z < 2; z++) {
			const box = new Box3();
			_v1.set(x, y, z);
			box.min.copy(this.box.min).add(_v1.multiply(halfsize));
			box.max.copy(box.min).add(halfsize);
			const subTree = new Octree(box); // Create child
			subTree.#worldTrianglesData = this.#worldTrianglesData; // Share data
			subTree.#isBuilt = true; // Children are part of a built structure
			subTrees.push(subTree);
		}}}

		let triangleIndex;
		while ((triangleIndex = this.triangles.pop()) !== undefined) {
			const tri = this.#_getTriangle(triangleIndex, _temp_triangle);
			for (let i = 0; i < subTrees.length; i++) {
				if (subTrees[i].box.intersectsTriangle(tri)) {
					subTrees[i].triangles.push(triangleIndex);
				}
			}
		}

		for (let i = 0; i < subTrees.length; i++) {
			const subTree = subTrees[i];
			const len = subTree.triangles.length;
			if (len > 8 && level < MAX_DEPTH) {
				subTree.split(level + 1);
			}
			if (len !== 0) {
				this.subTrees.push(subTree);
			}
		}
	}

	capsuleIntersect(capsule) {
		if (!this.#isBuilt) this.build(); // Just-In-Time build
		if (this.box.isEmpty() || !capsule.intersectsBox(this.box)) return false;

		const tempCapsule = capsule.clone();
		const triangles = [];
		let result, hit = false;
		
		this.getCapsuleTriangles(tempCapsule, triangles);

		for (const index of triangles) {
			const tri = this.#_getTriangle(index, _temp_triangle);
			if (result = this._triangleCapsuleIntersect(tempCapsule, tri)) {
				hit = true;
				tempCapsule.translate(result.normal.multiplyScalar(result.depth));
			}
		}

		if (hit) {
			const collisionVector = tempCapsule.getCenter(_v1).sub(capsule.getCenter(_v2));
			if (collisionVector.lengthSq() > 1e-10) {
				const depth = collisionVector.length();
				return { normal: collisionVector.normalize(), depth: depth };
			}
		}
		return false;
	}

	rayIntersect(ray) {
		if (!this.#isBuilt) this.build(); // Just-In-Time build
		if (this.box.isEmpty() || !ray.intersectsBox(this.box)) return false;
		
		const triangles = [];
		let closestResult = false;
		this.getRayTriangles(ray, triangles);

		for (const index of triangles) {
			const tri = this.#_getTriangle(index, _temp_triangle);
			const result = ray.intersectTriangle(tri.a, tri.b, tri.c, false, _v1);
			if (result) {
				const distSq = ray.origin.distanceToSquared(result);
				if (!closestResult || distSq < closestResult.distance * closestResult.distance) {
					closestResult = {
						distance: Math.sqrt(distSq),
						triangle: tri.clone(),
						position: result.clone()
					};
				}
			}
		}
		return closestResult;
	}

	getCapsuleTriangles(capsule, triangles) {
		for (const subTree of this.subTrees) {
			if (capsule.intersectsBox(subTree.box)) {
				subTree.getCapsuleTriangles(capsule, triangles);
			}
		}
		// Add leaf triangles
		for (const index of this.triangles) {
			if (triangles.indexOf(index) === -1) triangles.push(index);
		}
	}

	getRayTriangles(ray, triangles) {
		for (const subTree of this.subTrees) {
			if (ray.intersectsBox(subTree.box)) {
				subTree.getRayTriangles(ray, triangles);
			}
		}
		// Add leaf triangles
		for (const index of this.triangles) {
			if (triangles.indexOf(index) === -1) triangles.push(index);
		}
	}

	_triangleCapsuleIntersect(capsule, triangle) {
		triangle.getPlane(_plane);
		const d1 = _plane.distanceToPoint(capsule.start) - capsule.radius;
		const d2 = _plane.distanceToPoint(capsule.end) - capsule.radius;
		if ((d1 > 0 && d2 > 0) || (d1 < -capsule.radius && d2 < -capsule.radius)) return false;
		const delta = Math.abs(d1 / (Math.abs(d1) + Math.abs(d2)));
		const intersectPoint = _v1.copy(capsule.start).lerp(capsule.end, delta);
		if (triangle.containsPoint(intersectPoint)) {
			return { normal: _plane.normal.clone(), point: intersectPoint.clone(), depth: Math.abs(Math.min(d1, d2)) };
		}
		const r2 = capsule.radius * capsule.radius;
		_line1.set(capsule.start, capsule.end);
		const lines = [[triangle.a, triangle.b], [triangle.b, triangle.c], [triangle.c, triangle.a]];
		for (let i = 0; i < lines.length; i++) {
			_line2.set(lines[i][0], lines[i][1]);
			const [point1, point2] = capsule.lineLineMinimumPoints(_line1, _line2);
			if (point1.distanceToSquared(point2) < r2) {
				return { normal: point1.clone().sub(point2).normalize(), point: point2.clone(), depth: capsule.radius - point1.distanceTo(point2) };
			}
		}
		return false;
	}

	#getTriangleCount() { return this.#worldTrianglesData ? this.#worldTrianglesData.length / 9 : 0; }
	#_getTriangle(index, target) {
		const base = index * 9;
		target.a.fromArray(this.#worldTrianglesData, base);
		target.b.fromArray(this.#worldTrianglesData, base + 3);
		target.c.fromArray(this.#worldTrianglesData, base + 6);
		return target;
	}
}