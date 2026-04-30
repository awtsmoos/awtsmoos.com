
// B"H
import { Octree } from '/games/scripts/build/Octree.js';

/**
 * @module OctreeWorld
 * @description
 * THE SPIRITUAL GRID OF COLLISIONS (OCTREE).
 * Handles the subdivision of static matter for high-speed intersection tests.
 */
export default class OctreeWorld extends Octree {
    constructor(box) {
        super(box);
        console.log("B\"H - ⚓ [OCTREE]: World Octree manifested.");
    }

    /**
     * @method fromGraphNode
     * @description Overriding to add diagnostic light during geometry ingestion.
     */
    fromGraphNode(group) {
        if (!group) return;
        
        let meshCount = 0;
        let polyCount = 0;

        console.log(`B"H - ⚓ [OCTREE_GEN]: Starting ingestion of node: [${group.name || group.type}]`);

        group.traverse(child => {
            if (child.isMesh) {
                meshCount++;
                const geom = child.geometry;
                if (geom && geom.attributes && geom.attributes.position) {
                    polyCount += geom.attributes.position.count / 3;
                }
                
                // B"H: If the name implies it is a character or dynamic object, warn!
                if (child.name.toLowerCase().includes("chossid") || child.name.toLowerCase().includes("body")) {
                    console.warn(`B"H - 🚨 [OCTREE_WARNING]: Inserting potential DYNAMIC mesh into STATIC octree! Name: [${child.name}]. This will cause intense LAG.`);
                }
            }
        });

        console.log(`B"H - ⚓ [OCTREE_GEN]: Ingesting ${meshCount} mesh(es), approx ${Math.floor(polyCount)} polygons.`);
        
        const start = performance.now();
        const res = super.fromGraphNode(group);
        const end = performance.now();

        console.log(`B"H - ✅ [OCTREE_GEN]: Ingestion complete for [${group.name}] in ${(end - start).toFixed(2)}ms.`);
        return res;
    }

    /**
     * @method addMesh
     * @description Direct insertion monitoring.
     */
    addMesh(mesh) {
        console.log(`B"H - ⚓ [OCTREE]: Explicit mesh added: [${mesh.name}]`);
        return super.addMesh(mesh);
    }
}
