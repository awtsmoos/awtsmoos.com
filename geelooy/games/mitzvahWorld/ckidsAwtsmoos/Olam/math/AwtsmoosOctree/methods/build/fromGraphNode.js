
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

const MAX_TRIANGLES_PER_MESH = 10000; // B"H: Lowered for extreme safety. No single static object should exceed this.

// B"H: MODULE-LEVEL SCRATCH VECTORS — THE ETERNAL VESSELS
// These three vectors are created ONCE and reused for every triangle in every mesh.
// Previously they were re-declared inside the traverse() callback — meaning
// 3 new Vector3 objects per triangle. For an 80,000-triangle terrain:
// 80,000 x 3 = 240,000 heap allocations in one build call.
// The GC could not keep up — this was ROOT CAUSE #4 of the memory freeze.
//
// Like the Awtsmoos Who uses the same letters of the Aleph-Beis to create
// all of existence — we reuse the same vessels to extract every triangle.
const _meshScratch_v1 = new THREE.Vector3();
const _meshScratch_v2 = new THREE.Vector3();
const _meshScratch_v3 = new THREE.Vector3();

export default {
    fromGraphNode(group) {
        if (!group) return;
        group.updateMatrixWorld(true);

        group.traverse((obj) => {
            if (obj.isMesh && obj.geometry) {
                const meshName = obj.name || "Unnamed Mesh";
                const geomType = obj.geometry.type || "Unknown Type";
                // B"H: silent


                // B"H: THE DOUBLE SEAL OF EXCLUSION
                const isSolidOverride = obj.userData?.isSolid || obj.userData?.isBuilding;
                if (!isSolidOverride) {
                    if (
                        obj.userData?.isPlayer || 
                        obj.userData?.isNpc || 
                        obj.userData?.isLiving ||
                        obj.userData?.isSphere ||
                        obj.userData?.skipOctree ||
                        obj.name?.toLowerCase().includes("chossid") ||
                        obj.name?.toLowerCase().includes("player") ||
                        obj.name?.toLowerCase().includes("sphere") ||
                        obj.geometry.type?.includes("Sphere") ||
                        obj.geometry.type?.includes("Capsule") ||
                        obj.geometry.type?.includes("Torus")
                    ) {
                        return;
                    }
                }

                // 0. TRIANGLE COUNT CHECK
                // "He counts the number of the stars." (Tehillim 147:4)
                // If a mesh is too complex, it will shatter the memory of the vessel.
                const count = obj.geometry.index ? obj.geometry.index.count : obj.geometry.attributes.position.count;
                const limit = (obj.userData?.isTerrain || obj.userData?.isBuilding) ? 100000 : MAX_TRIANGLES_PER_MESH;
                if (count > limit * 3) {
                    console.warn(`B"H - 🚨 Skipping massive mesh [${obj.name}] with ${count/3} triangles! Limit is ${limit}.`);
                    return;
                }

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
                if (size.y < 0.1) {
                    box.min.y -= 0.5;
                    box.max.y += 0.5;
                }
                
                // Union the node's local box into the master Octree box
                this.box.union(box);

                // 3. EXTRACTING THE LETTERS (TRIANGLES)
                const geometry = obj.geometry.index ? obj.geometry.toNonIndexed() : obj.geometry;
                const pos = geometry.attributes.position;
                
                if (pos) {
                    for (let i = 0; i < pos.count; i += 3) {
                        _meshScratch_v1.fromBufferAttribute(pos, i).applyMatrix4(obj.matrixWorld);
                        _meshScratch_v2.fromBufferAttribute(pos, i + 1).applyMatrix4(obj.matrixWorld);
                        _meshScratch_v3.fromBufferAttribute(pos, i + 2).applyMatrix4(obj.matrixWorld);
                        
                        // B"H: ABSOLUTE TRUTH CHECK
                        // We must ensure the matter is not corrupted by the void (NaN).
                        // Corrupted data causes raycasting to fall into the abyss of the infinite loop.
                        const isCorrupt = 
                            isNaN(_meshScratch_v1.x) || isNaN(_meshScratch_v1.y) || isNaN(_meshScratch_v1.z) ||
                            isNaN(_meshScratch_v2.x) || isNaN(_meshScratch_v2.y) || isNaN(_meshScratch_v2.z) ||
                            isNaN(_meshScratch_v3.x) || isNaN(_meshScratch_v3.y) || isNaN(_meshScratch_v3.z);

                        if (isCorrupt) {
                            if (Math.random() < 0.01) {
                                console.warn(`B"H - 🚨 Corrupted vertex (NaN) detected in mesh [${obj.name}]! Purification in progress...`);
                            }
                            continue;
                        }

                        const triangle = new THREE.Triangle(
                            _meshScratch_v1.clone(),
                            _meshScratch_v2.clone(),
                            _meshScratch_v3.clone()
                        );
                        triangle.sourceMesh = obj;
                        
                        this.allTriangles.push(triangle);
                    }
                    // B"H: silent

                }

                // Free the temporary un-indexed geometry light
                if (obj.geometry.index) geometry.dispose();
            }
        });

        // Trigger the subdivision of space now that the matter is gathered
        this.isBuilt = false;
        if (!this._isManaged) {
            this.build();
        }
    }
};
