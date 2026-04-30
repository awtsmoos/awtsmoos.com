
// B"H
/**
 * @module fromGraphNode
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  CHAPTER 1: THE BREATH DESCENDS INTO MATTER                                    ║
 * ║                                                                                  ║
 * ║  "He breathed into his nostrils the soul of life."                             ║
 * ║                                                                                  ║
 * ║  Before the Tzimtzum, there was only infinite Ein Sof — no up, no down,        ║
 * ║  no triangles, no collision, no geometry, no math at all. Just pure            ║
 * ║  endless light beyond all comprehension. Then came the contraction,            ║
 * ║  the withdrawal, the Kav — the line of light that descended into the void       ║
 * ║  and began to carve vertices from nothingness.                                  ║
 * ║                                                                                  ║
 * ║  THIS FILE is that descent. It takes an Object3D hierarchy from the THREE.js    ║
 * ║  scene — a group of visible, beautiful meshes — and extracts from them         ║
 * ║  the hidden mathematical triangles that form their physical soul.               ║
 * ║  Each vertex is pulled through `applyMatrix4` — transported from local         ║
 * ║  coordinates to absolute world-space — just as the letters of creation         ║
 * ║  are permuted from primordial combinations into the specific physical forms     ║
 * ║  of stones and trees and stars.                                                 ║
 * ║                                                                                  ║
 * ║  Aleph-Beis-Nun spells Even (rock) only after the letters have been            ║
 * ║  transformed through the sacred cipher of At-Bash. So too, a geometry         ║
 * ║  only becomes a *physics triangle* after its vertices are transformed          ║
 * ║  through the matrixWorld. This is the At-Bash of the three-dimensional world.  ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @file fromGraphNode.js
 * @memberof AwtsmoosOctree/methods/build
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    /**
     * @method fromGraphNode
     * @description
     * Traverses the scene graph of a THREE.js Group, extracts every triangle
     * from every mesh, applies the world matrix to bring them into absolute
     * world-space coordinates, and stores them in `this.allTriangles` —
     * the master source of truth for the entire physics build.
     *
     * Each extracted Triangle is also decorated with a `sourceMesh` reference
     * pointing back to the original THREE.Mesh object. This is the sacred link
     * between the mathematical ghost and the visible vessel it represents.
     *
     * If the same mesh was previously registered (e.g., after a position update),
     * it is first removed via `removeMesh` before being re-ingested.
     *
     * @param {THREE.Object3D} group - The root of the hierarchy to ingest.
     *   This is typically a THREE.Group or THREE.Scene containing one or more
     *   THREE.Mesh children.
     * @returns {Octree} `this` — allows chaining: `octree.fromGraphNode(g).build()`
     */
    fromGraphNode(group) {
        // B"H: For normal scene objects, we MUST update the world matrix.
        // But for pre-transformed physics clones from OctreeWorld, this would
        // incorrectly reset them to the origin. We check for a flag.
        if (!group.userData.isPreTransformed) {
            group.updateWorldMatrix(true, true);
        }

        group.traverse((obj) => {
            if (obj.isMesh === true) {
                // B"H: If we already have triangles from this mesh, purge them first.
                // This ensures repositioned objects don't leave ghost-triangles behind!
                if (this.allTriangles.some(tri => tri.sourceMesh === obj)) {
                    this.removeMesh(obj);
                }

                let geometry, isTemp = false;

                // Handle indexed geometries by converting to non-indexed
                if (obj.geometry.index !== null) {
                    isTemp = true;
                    geometry = obj.geometry.toNonIndexed();
                } else {
                    geometry = obj.geometry;
                }

                const positionAttribute = geometry.getAttribute('position');
                if (positionAttribute) {
                    for (let i = 0; i < positionAttribute.count; i += 3) {
                        // Apply the absolute world-matrix to each vertex —
                        // this is the Kav descending from Keter to Malchus!
                        const v1 = new THREE.Vector3()
                            .fromBufferAttribute(positionAttribute, i)
                            .applyMatrix4(obj.matrixWorld);
                        const v2 = new THREE.Vector3()
                            .fromBufferAttribute(positionAttribute, i + 1)
                            .applyMatrix4(obj.matrixWorld);
                        const v3 = new THREE.Vector3()
                            .fromBufferAttribute(positionAttribute, i + 2)
                            .applyMatrix4(obj.matrixWorld);

                        const tri = new THREE.Triangle(v1, v2, v3);

                        // B"H: The link between the math and the soul!
                        // Without sourceMesh, the physics world is a ghost town.
                        tri.sourceMesh = obj;

                        this.allTriangles.push(tri);
                    }
                }

                // Clean up temporary non-indexed geometry to prevent memory leaks
                if (isTemp) geometry.dispose();
            }
        });

        this.isBuilt = false;
        return this;
    }
};
