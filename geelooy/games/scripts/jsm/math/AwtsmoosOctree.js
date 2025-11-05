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
	#worldTrianglesData;
	#isBuilt;

	// The new, lightweight metadata structure.
	// We map a Mesh to the location of its data in the Float32Array.
	#meshMetadata = new Map();

	constructor(box) {
		this.triangles = [];
		this.box = box || new Box3();
		this.subTrees = [];
		this.#worldTrianglesData = new Float32Array(0);
		this.#isBuilt = false;
	}

	fromGraphNode(group) {
		const newTriangles = [];
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
					// Triangles are created temporarily and then discarded
					const v1 = new Vector3().fromBufferAttribute(positionAttribute, i).applyMatrix4(obj.matrixWorld);
					const v2 = new Vector3().fromBufferAttribute(positionAttribute, i + 1).applyMatrix4(obj.matrixWorld);
					const v3 = new Vector3().fromBufferAttribute(positionAttribute, i + 2).applyMatrix4(obj.matrixWorld);
					newTriangles.push(new Triangle(v1, v2, v3));
				}
				if (isTemp) geometry.dispose();

				// Append the new triangle data to the master Float32Array
				const startIndex = this.#getTriangleCount();
				this.#appendTriangleData(newTriangles);

				// Store the metadata for this mesh
				this.#meshMetadata.set(obj, {
					startIndex: startIndex,
					count: newTriangles.length
				});
				newTriangles.length = 0; // Clear for next mesh
			}
		});

		this.#isBuilt = false;
		return this;
	}

	removeMesh(mesh) {
		if (!this.#meshMetadata.has(mesh)) return this;

		// When a mesh is removed, the data array becomes fragmented.
		// The only clean solution is to compact the array and rebuild.
		this.#meshMetadata.delete(mesh);
		this.#compact(); // This will rebuild the Float32Array from remaining metadata
		this.#isBuilt = false;

		return this;
	}

	#appendTriangleData(triangleArray) {
		if (triangleArray.length === 0) return;
		const originalLength = this.#worldTrianglesData.length;
		const newLength = originalLength + triangleArray.length * 9;
		const newArray = new Float32Array(newLength);
		
		newArray.set(this.#worldTrianglesData, 0);

		for (let i = 0; i < triangleArray.length; i++) {
			const tri = triangleArray[i];
			const baseIndex = originalLength + i * 9;
			newArray[baseIndex] = tri.a.x;
			newArray[baseIndex + 1] = tri.a.y;
			newArray[baseIndex + 2] = tri.a.z;
			newArray[baseIndex + 3] = tri.b.x;
			newArray[baseIndex + 4] = tri.b.y;
			newArray[baseIndex + 5] = tri.b.z;
			newArray[baseIndex + 6] = tri.c.x;
			newArray[baseIndex + 7] = tri.c.y;
			newArray[baseIndex + 8] = tri.c.z;
		}
		this.#worldTrianglesData = newArray;
	}

	#compact() {
		let totalTriangles = 0;
		for (const meta of this.#meshMetadata.values()) {
			totalTriangles += meta.count;
		}

		const newArray = new Float32Array(totalTriangles * 9);
		let currentIndex = 0;

		for (const [mesh, meta] of this.#meshMetadata.entries()) {
			const { startIndex, count } = meta;
			const subArray = this.#worldTrianglesData.subarray(startIndex * 9, (startIndex + count) * 9);
			newArray.set(subArray, currentIndex * 9);
			
			// IMPORTANT: Update the metadata with the new location
			meta.startIndex = currentIndex;
			currentIndex += count;
		}
		
		this.#worldTrianglesData = newArray;
	}


	build() {
		this.calcBox();
		this.split(0);
		this.#isBuilt = true;
		return this;
	}
	
	calcBox() {
		const triangleCount = this.#getTriangleCount();
		this.triangles = Array.from(Array(triangleCount).keys());
		this.box.makeEmpty();
		if (triangleCount > 0) {
			for (let i = 0; i < triangleCount; i++) {
				const tri = this.#_getTriangle(i, _temp_triangle);
				this.box.expandByPoint(tri.a).expandByPoint(tri.b).expandByPoint(tri.c);
			}
			this.box.min.x -= 0.01; this.box.min.y -= 0.01; this.box.min.z -= 0.01;
		}
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
			const subTree = new Octree(box);
			subTree.#worldTrianglesData = this.#worldTrianglesData;
			subTree.#isBuilt = true;
			subTrees.push(subTree);
		}}}

		let triangleIndex;
		while ((triangleIndex = this.triangles.pop()) !== undefined) {
			const tri = this.#_getTriangle(triangleIndex, _temp_triangle);
			for (const subTree of subTrees) {
				if (subTree.box.intersectsTriangle(tri)) {
					subTree.triangles.push(triangleIndex);
				}
			}
		}

		for (const subTree of subTrees) {
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
		if (!this.#isBuilt) this.build();
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
		if (!this.#isBuilt) this.build();
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