
// B"H
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _plane = new THREE.Plane();
const _line1 = new THREE.Line3();
const _line2 = new THREE.Line3();
const _temp_triangle = new THREE.Triangle();

export default {
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
	},
	
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
	},

	capsuleIntersect(capsule) {
    if (!this.isBuilt) this.build();
    if (this.box.isEmpty() || !capsule.intersectsBox(this.box)) return false;

    const resultCapsule = capsule.clone();
    let hit = false;
    
    const trianglesToCheck = [];
    this.getCapsuleTriangles(capsule, trianglesToCheck); 
    
    // CHECK 1: Static geometry
    for (const index of trianglesToCheck) {
        // --- B"H FIX: IGNORE DELETED ---
        const source = this.allTriangles[index] ? this.allTriangles[index].sourceMesh : null;
        if (source && !source.parent) continue; 
        // -------------------------------

        const tri = this._getTriangle(index, _temp_triangle);
        const result = this._triangleCapsuleIntersect(resultCapsule, tri);
        if (result) {
            hit = true;
            resultCapsule.translate(result.normal.multiplyScalar(result.depth));
        }
    }

    // CHECK 2: Dynamic triangles
    const dynamicTris = [];
    this._getDynamicCapsuleTriangles(capsule, dynamicTris);
    for (const tri of dynamicTris) {
        // --- B"H FIX: IGNORE DELETED ---
        if (tri.sourceMesh && !tri.sourceMesh.parent) continue;
        // -------------------------------

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
},

_getDynamicCapsuleTriangles(capsule, triangles) {
    for (const subTree of this.subTrees) {
        if (capsule.intersectsBox(subTree.box)) {
            subTree._getDynamicCapsuleTriangles(capsule, triangles);
        }
    }
    // This is a leaf node, add its dynamic triangles
    triangles.push(...this.dynamicTriangles);
},

	rayIntersect(ray) {
    if (!this.isBuilt) this.build();
    if (this.box.isEmpty() || !ray.intersectsBox(this.box)) return false;

    const trianglesToCheck = { staticIndices: new Set(), dynamicTris: new Set() };
    let closestResult = false;
    this._getHybridRayTriangles(ray, trianglesToCheck);

    // Check against STATIC triangles
    for (const index of trianglesToCheck.staticIndices) {
        const triangle = this._getTriangle(index, _temp_triangle);
        
        // --- B"H FIX: INSTANTLY IGNORE REMOVED OBJECTS ---
        // We check the master list for the source mesh. If it has no parent, it's deleted.
        const source = this.allTriangles[index] ? this.allTriangles[index].sourceMesh : null;
        if (source && !source.parent) continue; 
        // ------------------------------------------------

        const result = ray.intersectTriangle(triangle.a, triangle.b, triangle.c, false, _v1);
        if (result) {
            const distSq = ray.origin.distanceToSquared(result);
            if (!closestResult || distSq < closestResult.distance * closestResult.distance) {
                const hitNormal = new THREE.Vector3();
                triangle.getNormal(hitNormal);
                closestResult = { distance: Math.sqrt(distSq), triangle: triangle.clone(), position: result.clone(), normal: hitNormal, object: source };
            }
        }
    }
    
    // Check against DYNAMIC triangles
    for (const triangle of trianglesToCheck.dynamicTris) {
        // --- B"H FIX: INSTANTLY IGNORE REMOVED OBJECTS ---
        if (triangle.sourceMesh && !triangle.sourceMesh.parent) continue;
        // ------------------------------------------------

        const result = ray.intersectTriangle(triangle.a, triangle.b, triangle.c, false, _v1);
        if (result) {
            const distSq = ray.origin.distanceToSquared(result);
            if (!closestResult || distSq < closestResult.distance * closestResult.distance) {
                const hitNormal = new THREE.Vector3();
                triangle.getNormal(hitNormal);
                closestResult = { distance: Math.sqrt(distSq), triangle: triangle.clone(), position: result.clone(), normal: hitNormal, object: triangle.sourceMesh };
            }
        }
    }

    return closestResult;
},
	
	_getHybridRayTriangles(ray, result) {
	    for (const subTree of this.subTrees) {
	        if (ray.intersectsBox(subTree.box)) {
	            subTree._getHybridRayTriangles(ray, result);
	        }
	    }
	    for (const index of this.triangles) result.staticIndices.add(index);
	    for (const tri of this.dynamicTriangles) result.dynamicTris.add(tri);
	},
	
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
	},
	
	/**
	 * B"H
	 * Diagnostic helper to count all triangles this octree and its subtrees are managing.
	 * @returns {number}
	 */
	getTotalTriangleCount() {
	    let count = this.triangles.length;
	    for (const subTree of this.subTrees) {
	        count += subTree.getTotalTriangleCount();
	    }
	    return count;
	},
	
	getTriangleCount() { return this.worldTrianglesData ? this.worldTrianglesData.length / 9 : 0; },
	
	_getTriangle(index, target) {
		const base = index * 9;
		target.a.fromArray(this.worldTrianglesData, base);
		target.b.fromArray(this.worldTrianglesData, base + 3);
		target.c.fromArray(this.worldTrianglesData, base + 6);
		return target;
	},
	
	/**
	 * B"H
	 * Diagnostic helper to count all triangles this octree and its subtrees are managing.
	 * @returns {number}
	 */
	getTotalTriangleCount() {
	    let count = this.triangles.length;
	    for (const subTree of this.subTrees) {
	        count += subTree.getTotalTriangleCount();
	    }
	    return count;
	}
};
