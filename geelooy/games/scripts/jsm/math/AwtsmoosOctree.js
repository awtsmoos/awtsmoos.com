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
const _temp_triangle = new Triangle();

const MAX_DEPTH = 55;

export class Octree {
	// Holds Triangle objects until the build is triggered.
	// Kept permanently to allow for reliable removals and rebuilds.
	#allTriangles;
	
	// The memory-optimized flat array, derived from #allTriangles.
	#worldTrianglesData;

	// Flag to control the "Just-in-Time" build.
	#isBuilt;

	constructor(box) {
		this.triangles = []; // This will store triangle INDICES
		this.box = box || new Box3();
		this.subTrees = [];
		this.#allTriangles = [];
		this.#isBuilt = false;
	}
	
	_addTriangles = (triangles) => {
	    this.#allTriangles.push(...triangles);
	    this.#isBuilt = false;
	}

	fromGraphNode(group) {
		group.updateWorldMatrix(true, true);

		group.traverse((obj) => {
			if (obj.isMesh === true) {
				if (this.#allTriangles.some(tri => tri.sourceMesh === obj)) {
					this.removeMesh(obj);
				}
				
				let geometry, isTemp = false;
				if (obj.geometry.index !== null) { isTemp = true; geometry = obj.geometry.toNonIndexed(); } 
				else { geometry = obj.geometry; }

				const positionAttribute = geometry.getAttribute('position');
				if (positionAttribute) {
					for (let i = 0; i < positionAttribute.count; i += 3) {
						const v1 = new Vector3().fromBufferAttribute(positionAttribute, i).applyMatrix4(obj.matrixWorld);
						const v2 = new Vector3().fromBufferAttribute(positionAttribute, i + 1).applyMatrix4(obj.matrixWorld);
						const v3 = new Vector3().fromBufferAttribute(positionAttribute, i + 2).applyMatrix4(obj.matrixWorld);
						const tri = new Triangle(v1, v2, v3);
						tri.sourceMesh = obj;
						this.#allTriangles.push(tri);
					}
				}
				if (isTemp) geometry.dispose();
			}
		});

		this.#isBuilt = false;
		return this;
	}

	removeMesh(mesh) {
		const originalTriangleCount = this.#allTriangles.length;
		this.#allTriangles = this.#allTriangles.filter(tri => tri.sourceMesh !== mesh);
		if (this.#allTriangles.length < originalTriangleCount) {
			this.#isBuilt = false;
		}
		return this;
	}

	build() {
		this.subTrees = [];
		this.box.makeEmpty();
		
		this.#worldTrianglesData = new Float32Array(this.#allTriangles.length * 9);
		for (let i = 0; i < this.#allTriangles.length; i++) {
			const tri = this.#allTriangles[i];
			const baseIndex = i * 9;
			this.#worldTrianglesData[baseIndex] = tri.a.x; this.#worldTrianglesData[baseIndex+1] = tri.a.y; this.#worldTrianglesData[baseIndex+2] = tri.a.z;
			this.#worldTrianglesData[baseIndex+3] = tri.b.x; this.#worldTrianglesData[baseIndex+4] = tri.b.y; this.#worldTrianglesData[baseIndex+5] = tri.b.z;
			this.#worldTrianglesData[baseIndex+6] = tri.c.x; this.#worldTrianglesData[baseIndex+7] = tri.c.y; this.#worldTrianglesData[baseIndex+8] = tri.c.z;
			this.box.expandByPoint(tri.a).expandByPoint(tri.b).expandByPoint(tri.c);
		}
		
		if(this.#allTriangles.length > 0){
			this.box.min.x -= 0.01; this.box.min.y -= 0.01; this.box.min.z -= 0.01;
		}

		this.triangles = Array.from(Array(this.#allTriangles.length).keys());
		this.split(0);
		
		this.#isBuilt = true;
		return this;
	}

	split(level) {
		if(this.triangles.length === 0) return;

		const halfsize = _v2.copy(this.box.max).sub(this.box.min).multiplyScalar(0.5);
		const newSubTrees = [];
		for (let x = 0; x < 2; x++) { for (let y = 0; y < 2; y++) { for (let z = 0; z < 2; z++) {
			const box = new Box3();
			_v1.set(x, y, z);
			box.min.copy(this.box.min).add(_v1.multiply(halfsize));
			box.max.copy(box.min).add(halfsize);
			const subTree = new Octree(box);
			subTree.#worldTrianglesData = this.#worldTrianglesData;
			newSubTrees.push(subTree);
		}}}
		
		for (const index of this.triangles) {
			const tri = this.#_getTriangle(index, _temp_triangle);
			for (const subTree of newSubTrees) {
				if (subTree.box.intersectsTriangle(tri)) {
					subTree.triangles.push(index);
				}
			}
		}

		for (const subTree of newSubTrees) {
			const len = subTree.triangles.length;
			if (len > 8 && level < MAX_DEPTH) {
				subTree.split(level + 1);
			}
			if (len !== 0) {
				this.subTrees.push(subTree);
			}
		}
		
		// ------------------------- THE FIX IS HERE ------------------------------
		// After distributing triangles to children, clear this node's list.
		// Only leaf nodes (nodes with no subTrees) should hold triangle references.
		if (this.subTrees.length > 0) {
			this.triangles.length = 0;
		}
		// ------------------------------------------------------------------------
	}

	getCapsuleTriangles(capsule, triangles) {
		for (const subTree of this.subTrees) {
			if (capsule.intersectsBox(subTree.box)) {
				subTree.getCapsuleTriangles(capsule, triangles);
			}
		}
		
		// This part is now safe, because it will only run on leaf nodes
		// that actually contain the triangles for that specific area.
		for (const index of this.triangles) {
			if (triangles.indexOf(index) === -1) {
				triangles.push(index);
			}
		}
	}
	
	getRayTriangles(ray, triangles) {
		for (const subTree of this.subTrees) {
			if (ray.intersectsBox(subTree.box)) {
				subTree.getRayTriangles(ray, triangles);
			}
		}

		for (const index of this.triangles) {
			if (triangles.indexOf(index) === -1) {
				triangles.push(index);
			}
		}
	}

	capsuleIntersect(capsule) {
		if (!this.#isBuilt) this.build();
		if (this.box.isEmpty() || !capsule.intersectsBox(this.box)) return false;

		const resultCapsule = capsule.clone();
		let hit = false;
		
		const trianglesToCheck = [];
		this.getCapsuleTriangles(capsule, trianglesToCheck);
		
		for (const index of trianglesToCheck) {
			const tri = this.#_getTriangle(index, _temp_triangle);
			const result = this._triangleCapsuleIntersect(resultCapsule, tri);
			if (result) {
				hit = true;
				resultCapsule.translate(result.normal.multiplyScalar(result.depth));
			}
		}
		
		if (hit) {
			const collisionVector = resultCapsule.getCenter(_v1).sub(capsule.getCenter(_v2));
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
	
	    let closestResult = false;
	    const trianglesToCheck = [];
	    this.getRayTriangles(ray, trianglesToCheck);
	
	    for (const index of trianglesToCheck) {
	        const tri = this.#_getTriangle(index, _temp_triangle);
	        const result = ray.intersectTriangle(tri.a, tri.b, tri.c, false, _v1);
	        
	        if (result) {
	            const distSq = ray.origin.distanceToSquared(result);
	            if (!closestResult || distSq < closestResult.distance * closestResult.distance) {
	                
	                const hitNormal = new Vector3();
	                tri.getNormal(hitNormal);
	
	                closestResult = {
	                    distance: Math.sqrt(distSq),
	                    triangle: tri.clone(),
	                    position: result.clone(),
	                    normal: hitNormal
	                };
	            }
	        }
	    }
	
	    return closestResult;
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