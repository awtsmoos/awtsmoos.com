// B"H
import * as THREE from '/games/scripts/build/three.module.js';

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _temp_triangle = new THREE.Triangle();
const MAX_DEPTH = 12; // B"H: Reduced from 55 to prevent stack overflow/freezes

export default {
    addDynamicTriangle(triangle) {
	    if (!this.box.intersectsTriangle(triangle)) {
	        return;
	    }
	    if (this.subTrees.length > 0) {
	        for (const subTree of this.subTrees) {
	            subTree.addDynamicTriangle(triangle);
	        }
	    } else {
            // B"H FIX: Clone the triangle but KEEP the mesh reference!
            const clone = triangle.clone();
            clone.sourceMesh = triangle.sourceMesh;
	        this.dynamicTriangles.push(clone);
	    }
	},
	
	addTriangle(triangle) {
        // B"H: This method is deprecated in the dynamic system in favor of addDynamicTriangle
        // kept for interface compatibility if needed, but redirects to dynamic logic
        this.addDynamicTriangle(triangle);
    },
    
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
	            if (this.allTriangles.some(tri => tri.sourceMesh === obj)) {
	                this.removeMesh(obj);
	            }
	            
	            let geometry, isTemp = false;
	            if (obj.geometry.index !== null) { isTemp = true; geometry = obj.geometry.toNonIndexed(); } 
	            else { geometry = obj.geometry; }
	
	            const positionAttribute = geometry.getAttribute('position');
	            if (positionAttribute) {
	                for (let i = 0; i < positionAttribute.count; i += 3) {
	                    const v1 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i).applyMatrix4(obj.matrixWorld);
	                    const v2 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 1).applyMatrix4(obj.matrixWorld);
	                    const v3 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 2).applyMatrix4(obj.matrixWorld);
	                    const tri = new THREE.Triangle(v1, v2, v3);
                        
                        // --- B"H
                        // Link physics triangle to visual mesh ---
	                    tri.sourceMesh = obj;
                        // ----------------------------------------------------
                        
	                    this.allTriangles.push(tri);
	                }
	            }
	            if (isTemp) geometry.dispose();
	        }
	    });
	
	    this.isBuilt = false;
	    return this;
	},

	removeMesh(mesh) {
        // Only rebuilds if explicitly called (used for small dynamic nodes)
		const originalCount = this.allTriangles.length;
		this.allTriangles = this.allTriangles.filter(tri => tri.sourceMesh !== mesh);
        
        // Also remove from dynamic list
        this.dynamicTriangles = this.dynamicTriangles.filter(tri => tri.sourceMesh !== mesh);

		if (this.allTriangles.length < originalCount) {
			this.isBuilt = false; 
            this.worldTrianglesData = null; 
            this.build(); // Rebuild immediately for small chunks
		}
		return this;
	},
	/**
     * B"H
     * Background cleanup task.
     * Filters out ALL triangles whose meshes have been removed from the scene.
     */
    pruneDeadTriangles() {
        const startSize = this.allTriangles.length;
        
        // 1. Filter out anything that has no parent (removed from scene)
        this.allTriangles = this.allTriangles.filter(tri => {
            // Keep if source exists AND has a parent
            return tri.sourceMesh && tri.sourceMesh.parent;
        });
        
        this.dynamicTriangles = this.dynamicTriangles.filter(tri => tri.sourceMesh && tri.sourceMesh.parent);

        // 2. If we removed anything, rebuild the spatial tree
        if (this.allTriangles.length < startSize) {
            this.isBuilt = false;
            this.worldTrianglesData = null;
            this.build();
            console.log(`B"H - Pruned ${startSize - this.allTriangles.length} dead triangles from physics.`);
        }
        
        console.log(`B"H - Background Cleanup Complete. Pruned ${startSize - this.allTriangles.length} dead triangles from physics.`);
    },

	build() {
	//console.error(`[DIAGNOSTIC] build() called. Master list allTriangles has ${this.allTriangles.length} triangles BEFORE build.`);
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
		
		this.worldTrianglesData = new Float32Array(this.allTriangles.length * 9);
		for (let i = 0; i < this.allTriangles.length; i++) {
			const tri = this.allTriangles[i];
			const baseIndex = i * 9;
			this.worldTrianglesData[baseIndex] = tri.a.x; this.worldTrianglesData[baseIndex+1] = tri.a.y; this.worldTrianglesData[baseIndex+2] = tri.a.z;
			this.worldTrianglesData[baseIndex+3] = tri.b.x; this.worldTrianglesData[baseIndex+4] = tri.b.y; this.worldTrianglesData[baseIndex+5] = tri.b.z;
			this.worldTrianglesData[baseIndex+6] = tri.c.x; this.worldTrianglesData[baseIndex+7] = tri.c.y; this.worldTrianglesData[baseIndex+8] = tri.c.z;

			// --- BACKWARDS COMPATIBILITY LOGIC ---
			if (!this._isManaged) {
				// Only expand the box if we are a standalone octree.
		        this.box.expandByPoint(tri.a).expandByPoint(tri.b).expandByPoint(tri.c);
		    }
		}
		
		if(this.allTriangles.length > 0){
			this.box.min.x -= 0.01; this.box.min.y -= 0.01; this.box.min.z -= 0.01;
		}
        
        // B"H: Safety - Ensure box has volume to avoid infinite recursion on flat planes
        const size = new THREE.Vector3();
        this.box.getSize(size);
        if(size.x < 0.001) this.box.max.x += 0.1;
        if(size.y < 0.001) this.box.max.y += 0.1;
        if(size.z < 0.001) this.box.max.z += 0.1;

		this.triangles = Array.from(Array(this.allTriangles.length).keys());
		
		this.split(0);
		
		this.isBuilt = true;
		return this;
	},

	split(level) {
		if(this.triangles.length === 0) return;

		const halfsize = _v2.copy(this.box.max).sub(this.box.min).multiplyScalar(0.5);
		const newSubTrees = [];
		for (let x = 0; x < 2; x++) { for (let y = 0; y < 2; y++) { for (let z = 0; z < 2; z++) {
			const box = new THREE.Box3();
			_v1.set(x, y, z);
			box.min.copy(this.box.min).add(_v1.multiply(halfsize));
			box.max.copy(box.min).add(halfsize);
			const subTree = new this.constructor(box);
			subTree.worldTrianglesData = this.worldTrianglesData;
			newSubTrees.push(subTree);
		}}}
		
		for (const index of this.triangles) {
			const tri = this._getTriangle(index, _temp_triangle);
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

    
};
