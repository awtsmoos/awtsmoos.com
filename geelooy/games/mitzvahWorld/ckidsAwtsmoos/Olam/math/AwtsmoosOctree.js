// B"H
import {
	Box3,
	Line3,
	Plane,
	Sphere,
	Triangle,
	Vector3
} from '/games/scripts/build/three.module.js';
import { Capsule } from './Capsule.js';

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
		this.dynamicTriangles = [];
	}
	
	addDynamicTriangle(triangle) {
	    if (!this.box.intersectsTriangle(triangle)) {
	        return;
	    }
	    if (this.subTrees.length > 0) {
	        for (const subTree of this.subTrees) {
	            subTree.addDynamicTriangle(triangle);
	        }
	    } else {
	        this.dynamicTriangles.push(triangle.clone());
	    }
	}
	
	/**
	 * B"H
	 *  Resets the octree to a clean state without needing to create a new instance.
	 * This is critical for the performance of the dynamic OctreeWorld, which rebuilds
	 * chunk physics frequently.
	 */
	clear() {
	    this.#allTriangles.length = 0;
	    this.#worldTrianglesData = null; // Let garbage collector handle the old Float32Array
	    this.triangles.length = 0;
	    this.subTrees.length = 0;
	    this.box.makeEmpty();
	    this.#isBuilt = false;
	    this._isManaged = false; // When cleared, it reverts to a normal, unmanaged octree.

	    return this; // Allow chaining
	}
	
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
	
	_addTriangles = (triangles) => {
	    this.#allTriangles.push(...triangles);
	    this.#isBuilt = false;
	}
	
	/**
	     * B"H - NEW METHOD 1 of 2
	     * Surgically inserts a single triangle into the already-built octree.
	     * This is the key to our performance boost.
	     */
	    addTriangle(triangle) {
	        // First, add the triangle to the master data array. This is a very fast operation.
	        // We temporarily "un-build" the flat array to do this.
	        const newTriangles = [...this.#allTriangles, triangle];
	        this.#allTriangles = newTriangles;
	        
	        // Re-create the flat data array. This is much faster than re-traversing meshes.
	        this.#worldTrianglesData = new Float32Array(newTriangles.length * 9);
	        for (let i = 0; i < newTriangles.length; i++) {
	            const tri = newTriangles[i];
	            const baseIndex = i * 9;
	            this.#worldTrianglesData[baseIndex] = tri.a.x; this.#worldTrianglesData[baseIndex+1] = tri.a.y; this.#worldTrianglesData[baseIndex+2] = tri.a.z;
	            this.#worldTrianglesData[baseIndex+3] = tri.b.x; this.#worldTrianglesData[baseIndex+4] = tri.b.y; this.#worldTrianglesData[baseIndex+5] = tri.b.z;
	            this.#worldTrianglesData[baseIndex+6] = tri.c.x; this.#worldTrianglesData[baseIndex+7] = tri.c.y; this.#worldTrianglesData[baseIndex+8] = tri.c.z;
	        }
	
	        const newTriangleIndex = newTriangles.length - 1;
	
	        // Now, find the correct leaf node(s) and insert the index.
	        this._insertTriangleRecursive(this, newTriangleIndex, triangle);
	    }
	    
	    /**
     * B"H - NEW METHOD 2 of 2
     * The recursive helper function that traverses the tree to find the right leaf.
     */
    _insertTriangleRecursive(node, triangleIndex, triangle) {
        if (!node.box.intersectsTriangle(triangle)) {
            return;
        }

        if (node.subTrees.length === 0) {
            // This is a leaf node, add the triangle index here.
            node.triangles.push(triangleIndex);
        } else {
            // This is a branch node, recurse into children.
            for (const subTree of node.subTrees) {
                this._insertTriangleRecursive(subTree, triangleIndex, triangle);
            }
        }
    }

	fromGraphNode(group) {
	    // For normal scene objects, we MUST update the world matrix.
	    // But for pre-transformed physics clones from OctreeWorld, this would
	    // incorrectly move them to the origin. We check for a flag to prevent this.
	    if (!group.userData.isPreTransformed) {
	        group.updateWorldMatrix(true, true);
	    }
	   
	
	    group.traverse((obj) => {
	        if (obj.isMesh === true) {
		        //console.log(`[AwtsmoosOctree] Processing mesh "${obj.name}" to extract triangles.`); // LOG 4
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
	//console.error(`[DIAGNOSTIC] build() called. Master list #allTriangles has ${this.#allTriangles.length} triangles BEFORE build.`);
		// --- BACKWARDS COMPATIBILITY LOGIC ---
		if (!this._isManaged) {
			// If not managed, behave exactly as before: clear everything and calculate a new box.
			this.subTrees = []; 
			this.box.makeEmpty();
		} else {
			// If managed by OctreeWorld, ONLY clear the subTrees.
			// CRUCIALLY, we MUST NOT clear the box, as it has been precisely set by OctreeWorld.
			this.subTrees = [];
		}
		
		this.#worldTrianglesData = new Float32Array(this.#allTriangles.length * 9);
		for (let i = 0; i < this.#allTriangles.length; i++) {
			const tri = this.#allTriangles[i];
			const baseIndex = i * 9;
			this.#worldTrianglesData[baseIndex] = tri.a.x; this.#worldTrianglesData[baseIndex+1] = tri.a.y; this.#worldTrianglesData[baseIndex+2] = tri.a.z;
			this.#worldTrianglesData[baseIndex+3] = tri.b.x; this.#worldTrianglesData[baseIndex+4] = tri.b.y; this.#worldTrianglesData[baseIndex+5] = tri.b.z;
			this.#worldTrianglesData[baseIndex+6] = tri.c.x; this.#worldTrianglesData[baseIndex+7] = tri.c.y; this.#worldTrianglesData[baseIndex+8] = tri.c.z;

			// --- BACKWARDS COMPATIBILITY LOGIC ---
			if (!this._isManaged) {
				// Only expand the box if we are a standalone octree.
		        this.box.expandByPoint(tri.a).expandByPoint(tri.b).expandByPoint(tri.c);
		    }
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
		
		// After distributing triangles to children, clear this node's triangle list.
		// A parent with children should only be a structural container.
		// Only leaf nodes should hold triangle references. This stops the reference explosion.
		// This is a universal architectural improvement and is 100% backwards compatible.
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
    this.getCapsuleTriangles(capsule, trianglesToCheck); // This gets STATIC indices
    
    // CHECK 1: The fast, static geometry
    for (const index of trianglesToCheck) {
        const tri = this.#_getTriangle(index, _temp_triangle);
        const result = this._triangleCapsuleIntersect(resultCapsule, tri);
        if (result) {
            hit = true;
            resultCapsule.translate(result.normal.multiplyScalar(result.depth));
        }
    }

    // CHECK 2: The new, dynamic triangles
    const dynamicTris = [];
    this._getDynamicCapsuleTriangles(capsule, dynamicTris);
    for (const tri of dynamicTris) {
        const result = this._triangleCapsuleIntersect(resultCapsule, tri);
        if (result) {
            hit = true;
            resultCapsule.translate(result.normal.multiplyScalar(result.depth));
        }
    }

    // Return logic is now based on combined results
    if (hit) {
        const collisionVector = resultCapsule.getCenter(_v1).sub(capsule.getCenter(_v2));
        if (collisionVector.lengthSq() > 1e-10) {
            const depth = collisionVector.length();
            return { normal: collisionVector.normalize(), depth: depth };
        }
    }
    return false;
}

_getDynamicCapsuleTriangles(capsule, triangles) {
    for (const subTree of this.subTrees) {
        if (capsule.intersectsBox(subTree.box)) {
            subTree._getDynamicCapsuleTriangles(capsule, triangles);
        }
    }
    // This is a leaf node, add its dynamic triangles
    triangles.push(...this.dynamicTriangles);
}

	rayIntersect(ray) {
    if (!this.#isBuilt) this.build();
    if (this.box.isEmpty() || !ray.intersectsBox(this.box)) return false;

    const trianglesToCheck = { staticIndices: new Set(), dynamicTris: new Set() };
    let closestResult = false;
    this._getHybridRayTriangles(ray, trianglesToCheck);

    // Check against STATIC triangles from the fast buffer
    for (const index of trianglesToCheck.staticIndices) {
        const triangle = this.#_getTriangle(index, _temp_triangle);
        const result = ray.intersectTriangle(triangle.a, triangle.b, triangle.c, false, _v1);
        if (result) {
            const distSq = ray.origin.distanceToSquared(result);
            if (!closestResult || distSq < closestResult.distance * closestResult.distance) {
                const hitNormal = new Vector3();
                triangle.getNormal(hitNormal);
                closestResult = { distance: Math.sqrt(distSq), triangle: triangle.clone(), position: result.clone(), normal: hitNormal };
            }
        }
    }
    
    // Check against DYNAMIC triangles from the simple array
    for (const triangle of trianglesToCheck.dynamicTris) {
        const result = ray.intersectTriangle(triangle.a, triangle.b, triangle.c, false, _v1);
        if (result) {
            const distSq = ray.origin.distanceToSquared(result);
            if (!closestResult || distSq < closestResult.distance * closestResult.distance) {
                const hitNormal = new Vector3();
                triangle.getNormal(hitNormal);
                closestResult = { distance: Math.sqrt(distSq), triangle: triangle.clone(), position: result.clone(), normal: hitNormal };
            }
        }
    }

    return closestResult;
}
	
	_getHybridRayTriangles(ray, result) {
	    for (const subTree of this.subTrees) {
	        if (ray.intersectsBox(subTree.box)) {
	            subTree._getHybridRayTriangles(ray, result);
	        }
	    }
	    for (const index of this.triangles) result.staticIndices.add(index);
	    for (const tri of this.dynamicTriangles) result.dynamicTris.add(tri);
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
	
	#getTriangleCount() { return this.#worldTrianglesData ? this.#worldTrianglesData.length / 9 : 0; }
	#_getTriangle(index, target) {
		const base = index * 9;
		target.a.fromArray(this.#worldTrianglesData, base);
		target.b.fromArray(this.#worldTrianglesData, base + 3);
		target.c.fromArray(this.#worldTrianglesData, base + 6);
		return target;
	}
}