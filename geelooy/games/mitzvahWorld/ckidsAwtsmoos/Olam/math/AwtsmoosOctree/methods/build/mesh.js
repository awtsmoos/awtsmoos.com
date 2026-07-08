
// B"H
/**
 * @module MeshHarvester
 * @description
 * 🪐 THE HARVEST OF FORMS 🪐
 * 
 * A 3D model is but a localized grouping of concepts. When the Awtsmoos desires to 
 * make it a solid reality that cannot be passed through, we must strip away the illusion
 * of the "Mesh" and extract the raw, unyielding truth of the triangles!
 * 
 * This module traverses the hierarchical tree of a Three.js Group, finds every Mesh,
 * and harvests its triangles, linking them back to the source mesh. Furthermore, it provides
 * the power of eradication (`removeMesh`) and the sweeping winds of time (`pruneDeadTriangles`)
 * to clean up the void.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    /**
     * @method fromGraphNode
     * @description 
     * Recursively traverses a node graph, extracting the geometry of every mesh
     * and converting it into absolute world-space triangles.
     * 
     * @param {THREE.Object3D} group - The spiritual hierarchy to solidify.
     * @returns {Object} Returns the Octree instance for chaining.
     */
    fromGraphNode(group) {
        // For normal scene objects, we MUST update the world matrix.
        // But for pre-transformed physics clones from OctreeWorld, this would
        // incorrectly move them to the origin. We check for a flag to prevent this.
        if (group.userData && !group.userData.isPreTransformed) {
            group.updateWorldMatrix(true, true);
        }
       
        group.traverse((obj) => {
            if (obj.isMesh === true) {
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
                        
                        // --- B"H Link physics triangle to visual mesh ---
                        tri.sourceMesh = obj;
                        
                        this.allTriangles.push(tri);
                    }
                }
                if (isTemp) geometry.dispose();
            }
        });
    
        this.isBuilt = false;
        return this;
    },

    /**
     * @method removeMesh
     * @description
     * Obliterates all physical presence of a specific mesh from the spatial tree.
     * If the mesh's letters are removed, it ceases to exist instantly!
     * 
     * @param {THREE.Mesh} mesh - The mesh to eradicate from physics.
     * @returns {Object} Returns the Octree instance.
     */
    removeMesh(mesh) {
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
     * @method pruneDeadTriangles
     * @description
     * The Great Sweeper of the Void! Iterates through the master list of all triangles,
     * checking if their source mesh has been severed from the scene graph. If so, they
     * are deleted from existence, preventing phantom collisions!
     * 
     * @returns {void}
     */
    pruneDeadTriangles() {
        const startSize = this.allTriangles.length;
        
        // 1. Filter out anything that has no parent (removed from scene)
        this.allTriangles = this.allTriangles.filter(tri => {
            return tri.sourceMesh && tri.sourceMesh.parent;
        });
        
        this.dynamicTriangles = this.dynamicTriangles.filter(tri => tri.sourceMesh && tri.sourceMesh.parent);

        // 2. If we removed anything, rebuild the spatial tree
        if (this.allTriangles.length < startSize) {
            this.isBuilt = false;
            this.worldTrianglesData = null;
            this.build();
            // B"H: silent

        }
    }
};
