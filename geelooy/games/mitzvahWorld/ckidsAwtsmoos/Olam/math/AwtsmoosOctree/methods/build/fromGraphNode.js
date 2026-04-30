
/**
 * @file fromGraphNode.js
 * @description
 * * Chapter 22: The Solidification of Breath
 * "He established the world upon its foundations." (Tehillim 104:5)
 * 
 * In the beginning, the world was unformed, a collection of points and lines. 
 * Then the Awtsmoos spoke the Word, and the triangles gathered together 
 * into a single physical grid. But some vessels were too thin, lacking 
 * the depth to hold the weight of the souls above!
 * 
 * This module traverses the hierarchy of a 3D object and extracts its triangles.
 * TIKKUN: If a mesh is flat (like a Plane), we expand its bounding box by a 
 * hair's breadth (0.05) so the Octree's mathematical divisions don't 
 * collapse into a zero-volume paradox.
 * 
 * @param {THREE.Object3D} group - The vessel to analyze.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    fromGraphNode(group) {
        if (!group) return;
        group.updateMatrixWorld(true);

        group.traverse((obj) => {
            if (obj.isMesh && obj.geometry) {
                // 1. REVEALING THE BOUNDS
                // The physical boundary of the object must be measured with absolute truth.
                if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
                const box = obj.geometry.boundingBox.clone();
                box.applyMatrix4(obj.matrixWorld);

                // 2. THE TIKKUN OF THICKNESS
                // If the box is flat in any dimension (like a 2D ground), we give it spiritual "body".
                // This prevents the Octree from becoming a zero-thickness barrier that the player falls through.
                const size = new THREE.Vector3();
                box.getSize(size);
                if (size.y < 0.01) {
                    box.min.y -= 0.1;
                    box.max.y += 0.1;
                }
                
                // Union the node's local box into the master Octree box
                this.box.union(box);

                // 3. EXTRACTING THE LETTERS (TRIANGLES)
                const geometry = obj.geometry.index ? obj.geometry.toNonIndexed() : obj.geometry;
                const pos = geometry.attributes.position;

                if (pos) {
                    for (let i = 0; i < pos.count; i += 3) {
                        const v1 = new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(obj.matrixWorld);
                        const v2 = new THREE.Vector3().fromBufferAttribute(pos, i + 1).applyMatrix4(obj.matrixWorld);
                        const v3 = new THREE.Vector3().fromBufferAttribute(pos, i + 2).applyMatrix4(obj.matrixWorld);
                        
                        const triangle = new THREE.Triangle(v1, v2, v3);
                        triangle.sourceMesh = obj;
                        
                        // Add to the eternal master list
                        this.allTriangles.push(triangle);
                    }
                }

                // Free the temporary un-indexed geometry light
                if (obj.geometry.index) geometry.dispose();
            }
        });

        // Trigger the subdivision of space now that the matter is gathered
        this.isBuilt = false;
        this.build();
    }
};
