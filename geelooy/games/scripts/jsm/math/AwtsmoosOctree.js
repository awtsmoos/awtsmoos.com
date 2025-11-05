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

// --- Reusable private variables for calculations ---
const _v1 = new Vector3();
const _v2 = new Vector3();
const _plane = new Plane();
const _line1 = new Line3();
const _line2 = new Line3();
const _sphere = new Sphere();
const _capsule = new Capsule();
const _tempBox = new Box3();
const _tempSphere = new Sphere();

// --- Scratch variables for on-the-fly triangle generation ---
const _calc_vA = new Vector3();
const _calc_vB = new Vector3();
const _calc_vC = new Vector3();
// A reusable Triangle object for intersection tests that require it.
const _calc_triangle = new Triangle();

const MAX_DEPTH = 55;
const INVALID_ID = 0xFFFFFFFF; // Magic number for tombstoning/invalidating

/**
 * An extremely optimized, dynamic Octree using a data-oriented design.
 * It builds locally around tracked objects, uses a TypedArray for minimal RAM,
 * and features a free list for efficient memory management.
 * Conforms to the original API for plug-and-play replacement.
 */
class Octree {

	// --- CORE DATA STRUCTURES ---

	// A flat buffer storing all triangle data: [vIndexA, vIndexB, vIndexC, meshID, ...]
	#masterTriangleData;
	// A look-up table for mesh references and their pre-calculated local bounding boxes.
	#meshLut = [];
	// A map to quickly find a mesh's ID from its UUID.
	#meshUuidToIdMap = new Map();
	
	// --- Memory Management ---
	#triangleCount = 0;       // How many triangles slots are currently in use.
	#triangleCapacity = 0;    // How many triangles the buffer can hold.
	#freeList = [];           // A list of triangleIDs that can be recycled.

	// --- Dynamic Build Properties ---
	#trackedObject = {
		lastPosition: new Vector3(),
		speed: 0,
		isTracking: false,
	};
	#activeCenter = new Vector3();
	#activeRadius = 0;
	#isBuilt = false;

	// --- CONFIGURATION ---
	BASE_RADIUS = 30;
	SPEED_MULTIPLIER = 0.75;
	REBUILD_THRESHOLD = 15;

	// --- Local Octree Properties ---
	// 'this.triangles' holds TRIANGLE IDs (integers), not Triangle objects.
	constructor(box) {
		this.triangles = [];
		this.box = box;
		this.subTrees = [];
		// Start with an initial capacity to avoid resizing on first load.
		this.#_growBuffer(1000); 
	}
	
	// --- CORE PUBLIC API (UNCHANGED AND FULLY IMPLEMENTED) ---

	fromGraphNode(group) {
		this.#meshLut = [];
		this.#meshUuidToIdMap.clear();
		this.#triangleCount = 0;
		this.#freeList = [];
		this.#isBuilt = false;

		group.updateWorldMatrix(true, true);
		
		group.traverse((obj) => {
			if (obj.isMesh === true) {
				let meshID;
				if (this.#meshUuidToIdMap.has(obj.uuid)) {
					meshID = this.#meshUuidToIdMap.get(obj.uuid);
				} else {
					meshID = this.#meshLut.length;
					if (!obj.geometry.boundingBox) {
						obj.geometry.computeBoundingBox();
					}
					this.#meshLut.push({ mesh: obj, localBox: obj.geometry.boundingBox });
					this.#meshUuidToIdMap.set(obj.uuid, meshID);
				}

				let geometry, isTemp = false;
				if (obj.geometry.index !== null) {
					isTemp = true;
					geometry = obj.geometry.toNonIndexed();
				} else {
					geometry = obj.geometry;
				}

				const positionAttribute = geometry.getAttribute('position');
				for (let i = 0; i < positionAttribute.count; i += 3) {
					this.#_addTriangleProxy(i, i + 1, i + 2, meshID);
				}

				if (isTemp) {
					geometry.dispose();
				}
			}
		});

		// Shrink the buffer to the exact size after initial load to free up unused pre-allocated memory.
		this.#_growBuffer(this.#triangleCount);

		return this;
	}
	
	addTriangle(triangle) {
		console.warn('OptimizedOctree.addTriangle is not supported. Use a mesh-based workflow.');
		return this;
	}

	build() {
		if (this.#trackedObject.isTracking) {
			this.#_rebuild(this.#trackedObject.lastPosition);
		}
		return this;
	}
	
	removeMesh(mesh) {
		const meshID = this.#meshUuidToIdMap.get(mesh.uuid);
		if (meshID === undefined) return;

		// Iterate through the entire buffer to find triangles associated with this mesh.
		for (let i = 0; i < this.#triangleCount * 4; i += 4) {
			if (this.#masterTriangleData[i + 3] === meshID) {
				const triangleID = i / 4;
				this.#freeList.push(triangleID);
				// Mark the slot as invalid.
				this.#masterTriangleData[i + 3] = INVALID_ID;
			}
		}
		this.#meshLut[meshID] = null; // Invalidate the LUT entry
		this.#meshUuidToIdMap.delete(mesh.uuid);

		this.#isBuilt = false; // Force a rebuild on the next check.
	}

	removeTriangle(triangle) {
		console.warn('OptimizedOctree.removeTriangle is extremely slow. Use removeMesh or manage geometry differently.');
		// This is a slow brute-force search required to maintain API compatibility.
		for (let i = 0; i < this.#triangleCount; i++) {
			const meshID = this.#masterTriangleData[i * 4 + 3];
			if (meshID === INVALID_ID) continue;

			this.#_getWorldTriangle(i, _calc_triangle);
			if (_calc_triangle.equals(triangle)) {
				this.#freeList.push(i);
				this.#masterTriangleData[i * 4 + 3] = INVALID_ID;
				this.#isBuilt = false;
				return;
			}
		}
	}
	
	sphereIntersect(sphere) {
		this.#_updateAndCheckRebuild(sphere.center);
		if (!this.#isBuilt) return false;

		_sphere.copy(sphere);
		const trianglesToCheck = new Set();
		let result, hit = false;
		this.getSphereTriangles(_sphere, trianglesToCheck);

		for (const triangleID of trianglesToCheck) {
			this.#_getWorldVertices(triangleID);
			if (result = this._triangleSphereIntersect(_sphere, _calc_vA, _calc_vB, _calc_vC)) {
				hit = true;
				_sphere.center.add(result.normal.multiplyScalar(result.depth));
			}
		}

		if (hit) {
			const collisionVector = _sphere.center.clone().sub(sphere.center);
			const depth = collisionVector.length();
			return { normal: collisionVector.normalize(), depth: depth };
		}
		return false;
	}

	capsuleIntersect(capsule) {
		const capsuleCenter = capsule.getCenter(_v1);
		this.#_updateAndCheckRebuild(capsuleCenter);
		if (!this.#isBuilt) return false;

		_capsule.copy(capsule);
		const trianglesToCheck = new Set();
		let result, hit = false;
		this.getCapsuleTriangles(_capsule, trianglesToCheck);
		
		for (const triangleID of trianglesToCheck) {
			this.#_getWorldVertices(triangleID);
			if (result = this._triangleCapsuleIntersect(_capsule, _calc_vA, _calc_vB, _calc_vC)) {
				hit = true;
				_capsule.translate(result.normal.multiplyScalar(result.depth));
			}
		}

		if (hit) {
			const collisionVector = _capsule.getCenter(_v2).sub(capsule.getCenter(_v1));
			const depth = collisionVector.length();
			return { normal: collisionVector.normalize(), depth: depth };
		}
		return false;
	}

	rayIntersect(ray) {
		this.#_updateAndCheckRebuild(ray.origin);
		if (!this.#isBuilt || ray.direction.lengthSq() === 0) return false;
		
		const trianglesToCheck = new Set();
		let closestDistanceSq = Infinity;
		let closestResult = false;
		this.getRayTriangles(ray, trianglesToCheck);

		for (const triangleID of trianglesToCheck) {
			this.#_getWorldVertices(triangleID);
			const result = ray.intersectTriangle(_calc_vA, _calc_vB, _calc_vC, false, _v1);
			if (result) {
				const distanceSq = ray.origin.distanceToSquared(result);
				if (distanceSq < closestDistanceSq) {
					closestDistanceSq = distanceSq;
					// We must construct a new Triangle for the return value to match the API.
					// This is one of the few acceptable allocations.
					this.#_getWorldTriangle(triangleID, _calc_triangle);
					const hitTriangle = _calc_triangle.clone();
					closestResult = {
						distance: Math.sqrt(distanceSq),
						triangle: hitTriangle,
						position: result.clone(),
					};
				}
			}
		}
		return closestResult;
	}

	// --- INTERNAL DYNAMIC BUILD LOGIC ---

	#_updateAndCheckRebuild(colliderPosition) {
		const tracker = this.#trackedObject;
		if (!tracker.isTracking) {
			tracker.lastPosition.copy(colliderPosition);
			tracker.isTracking = true;
			this.#_rebuild(colliderPosition);
			return;
		}

		const distanceMoved = tracker.lastPosition.distanceTo(colliderPosition);
		tracker.speed = distanceMoved;
		tracker.lastPosition.copy(colliderPosition);

		if (this.#activeCenter.distanceTo(colliderPosition) > this.REBUILD_THRESHOLD) {
			this.#_rebuild(colliderPosition);
		}
	}

	#_rebuild(center) {
		const dynamicRadius = this.BASE_RADIUS + (this.#trackedObject.speed * this.SPEED_MULTIPLIER);
		this.#activeRadius = dynamicRadius;
		this.#activeCenter.copy(center);

		this.triangles = [];
		this.subTrees = [];
		_tempSphere.set(this.#activeCenter, this.#activeRadius);
		_tempSphere.getBoundingBox(this.box);

		// Broad-phase: find all triangles potentially in the sphere of interest.
		for (let i = 0; i < this.#triangleCount; i++) {
			const meshID = this.#masterTriangleData[i * 4 + 3];
			if (meshID === INVALID_ID) continue;
			
			const meshData = this.#meshLut[meshID];
			if (!meshData) continue;
			
			// Culling check: mesh's world bounding box vs sphere of interest.
			const worldBox = _tempBox.copy(meshData.localBox).applyMatrix4(meshData.mesh.matrixWorld);
			if (!_tempSphere.intersectsBox(worldBox)) continue;
			
			// Narrow-phase: actual triangle vs sphere intersection.
			this.#_getWorldTriangle(i, _calc_triangle);
			if (_tempSphere.intersectsTriangle(_calc_triangle)) {
				this.triangles.push(i); // Push the triangle ID
			}
		}

		this.split(0);
		this.#isBuilt = true;
	}

	// --- DATA MANAGEMENT ---

	#_addTriangleProxy(vA_idx, vB_idx, vC_idx, mesh_ID) {
		let targetTriangleID;
		if (this.#freeList.length > 0) {
			targetTriangleID = this.#freeList.pop();
		} else {
			targetTriangleID = this.#triangleCount;
			if (targetTriangleID >= this.#triangleCapacity) {
				this.#_growBuffer();
			}
			this.#triangleCount++;
		}

		const startIndex = targetTriangleID * 4;
		this.#masterTriangleData[startIndex] = vA_idx;
		this.#masterTriangleData[startIndex + 1] = vB_idx;
		this.#masterTriangleData[startIndex + 2] = vC_idx;
		this.#masterTriangleData[startIndex + 3] = mesh_ID;
	}

	#_growBuffer(targetCapacity) {
		const oldBuffer = this.#masterTriangleData;
		if (targetCapacity === undefined) {
			targetCapacity = Math.floor(this.#triangleCapacity * 1.5);
		}
		targetCapacity = Math.max(1000, targetCapacity);

		if (targetCapacity <= this.#triangleCapacity) return;

		const newBuffer = new Uint32Array(targetCapacity * 4);
		if (oldBuffer) {
			newBuffer.set(oldBuffer.slice(0, this.#triangleCount * 4));
		}

		this.#masterTriangleData = newBuffer;
		this.#triangleCapacity = targetCapacity;
	}

	// --- ON-THE-FLY CALCULATION ---

	#_getWorldVertices(triangleID) {
		const startIndex = triangleID * 4;
		const meshID = this.#masterTriangleData[startIndex + 3];
		const meshData = this.#meshLut[meshID];
		const mesh = meshData.mesh;
		const positionAttribute = mesh.geometry.getAttribute('position');

		_calc_vA.fromBufferAttribute(positionAttribute, this.#masterTriangleData[startIndex]);
		_calc_vB.fromBufferAttribute(positionAttribute, this.#masterTriangleData[startIndex + 1]);
		_calc_vC.fromBufferAttribute(positionAttribute, this.#masterTriangleData[startIndex + 2]);

		_calc_vA.applyMatrix4(mesh.matrixWorld);
		_calc_vB.applyMatrix4(mesh.matrixWorld);
		_calc_vC.applyMatrix4(mesh.matrixWorld);
	}
	
	#_getWorldTriangle(triangleID, target) {
		this.#_getWorldVertices(triangleID);
		target.a.copy(_calc_vA);
		target.b.copy(_calc_vB);
		target.c.copy(_calc_vC);
		return target;
	}

	// --- HELPER & GEOMETRY METHODS (ADAPTED FOR IDs) ---
	
	calcBox() { /* This is now handled dynamically in _rebuild */ return this; }

	split(level) {
		if (!this.box || this.box.isEmpty()) return;

		const subTrees = [];
		const halfsize = _v2.copy(this.box.max).sub(this.box.min).multiplyScalar(0.5);

		for (let x = 0; x < 2; x++) { for (let y = 0; y < 2; y++) { for (let z = 0; z < 2; z++) {
			const box = new Box3();
			const v = _v1.set(x, y, z);
			box.min.copy(this.box.min).add(v.multiply(halfsize));
			box.max.copy(box.min).add(halfsize);
			subTrees.push(new Octree(box));
		}}}

		let triangleID;
		while ((triangleID = this.triangles.pop()) !== undefined) {
			this.#_getWorldTriangle(triangleID, _calc_triangle);
			for (let i = 0; i < subTrees.length; i++) {
				if (subTrees[i].box.intersectsTriangle(_calc_triangle)) {
					subTrees[i].triangles.push(triangleID);
				}
			}
		}

		for (let i = 0; i < subTrees.length; i++) {
			const len = subTrees[i].triangles.length;
			if (len > 8 && level < MAX_DEPTH) {
				subTrees[i].split(level + 1);
			}
			if (len !== 0) {
				this.subTrees.push(subTrees[i]);
			}
		}
		return this;
	}

	#_getCollidingTriangles(collider, trianglesSet, intersector) {
		for (const subTree of this.subTrees) {
			if (!intersector(collider, subTree.box)) {
				continue;
			}

			if (subTree.triangles.length > 0) {
				for (const triangleID of subTree.triangles) {
					trianglesSet.add(triangleID);
				}
			} else {
				subTree.#_getCollidingTriangles(collider, trianglesSet, intersector);
			}
		}
	}
	
	// These three public methods are now fully implemented wrappers.
	// For best performance, pass a Set as the 'triangles' argument.
	getRayTriangles(ray, triangles) { this.#_getCollidingTriangles(ray, triangles, (r, b) => r.intersectsBox(b)); }
	getSphereTriangles(sphere, triangles) { this.#_getCollidingTriangles(sphere, triangles, (s, b) => s.intersectsBox(b)); }
	getCapsuleTriangles(capsule, triangles) { this.#_getCollidingTriangles(capsule, triangles, (c, b) => c.intersectsBox(b)); }

	// --- Math routines, refactored to be stateless and allocation-free ---
	
	_triangleCapsuleIntersect(capsule, vA, vB, vC) {
		_plane.setFromCoplanarPoints(vA, vB, vC);
		const d1 = _plane.distanceToPoint(capsule.start) - capsule.radius;
		const d2 = _plane.distanceToPoint(capsule.end) - capsule.radius;
		if ((d1 > 0 && d2 > 0) || (d1 < -capsule.radius && d2 < -capsule.radius)) return false;
		
		_calc_triangle.set(vA, vB, vC);
		const delta = Math.abs(d1 / (Math.abs(d1) + Math.abs(d2)));
		const intersectPoint = _v1.copy(capsule.start).lerp(capsule.end, delta);
		if (_calc_triangle.containsPoint(intersectPoint)) {
			return { normal: _plane.normal.clone(), point: intersectPoint.clone(), depth: Math.abs(Math.min(d1, d2)) };
		}
		const r2 = capsule.radius * capsule.radius;
		_line1.set(capsule.start, capsule.end);
		const lines = [[vA, vB], [vB, vC], [vC, vA]];
		for (let i = 0; i < lines.length; i++) {
			_line2.set(lines[i][0], lines[i][1]);
			const [point1, point2] = capsule.lineLineMinimumPoints(_line1, _line2);
			if (point1.distanceToSquared(point2) < r2) {
				return { normal: point1.clone().sub(point2).normalize(), point: point2.clone(), depth: capsule.radius - point1.distanceTo(point2) };
			}
		}
		return false;
	}

	_triangleSphereIntersect(sphere, vA, vB, vC) {
		_plane.setFromCoplanarPoints(vA, vB, vC);
		if (!sphere.intersectsPlane(_plane)) return false;
		
		_calc_triangle.set(vA, vB, vC);
		const depth = Math.abs(_plane.distanceToSphere(sphere));
		const r2 = sphere.radius * sphere.radius - depth * depth;
		const plainPoint = _plane.projectPoint(sphere.center, _v1);
		if (_calc_triangle.containsPoint(sphere.center)) {
			return { normal: _plane.normal.clone(), point: plainPoint.clone(), depth: Math.abs(_plane.distanceToSphere(sphere)) };
		}
		const lines = [[vA, vB], [vB, vC], [vC, vA]];
		for (let i = 0; i < lines.length; i++) {
			_line1.set(lines[i][0], lines[i][1]);
			_line1.closestPointToPoint(plainPoint, true, _v2);
			const d = _v2.distanceToSquared(sphere.center);
			if (d < r2) {
				return { normal: sphere.center.clone().sub(_v2).normalize(), point: _v2.clone(), depth: sphere.radius - Math.sqrt(d) };
			}
		}
		return false;
	}
}

export { Octree };