
// B"H
import { Octree } from '/games/scripts/jsm/math/Octree.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/**
 * @module OctreeWorld
 * @description
 * THE SPIRITUAL GRID OF COLLISIONS (OCTREE).
 * Handles the subdivision of static matter for high-speed intersection tests.
 */
export default class OctreeWorld extends Octree {
    constructor(box) {
        super(box);
        // B"H: silent

    }

    /**
     * @method fromGraphNode
     * @description Overriding to add diagnostic light during geometry ingestion.
     */
    fromGraphNode(group) {
        if (!group) return;
        
        let meshCount = 0;
        let polyCount = 0;

        // B"H: silent


        group.traverse(child => {
            if (child.isMesh) {
                meshCount++;
                const geom = child.geometry;
                if (geom && geom.attributes && geom.attributes.position) {
                    polyCount += geom.attributes.position.count / 3;
                }
                
                // B"H: If the name implies it is a character or dynamic object, warn!
                if (child.name.toLowerCase().includes("chossid") || child.name.toLowerCase().includes("body")) {
                    console.warn(`B"H - 🚨[OCTREE_WARNING]: Inserting potential DYNAMIC mesh into STATIC octree! Name: [${child.name}]. This will cause intense LAG.`);
                }
            }
        });

        // B"H: silent

        
        const start = performance.now();
        const res = super.fromGraphNode(group);
        const end = performance.now();

        // B"H: silent

        return res;
    }

    /**
     * @method addMesh
     * @description Direct insertion monitoring.
     */
    addMesh(mesh) {
        // B"H: silent

        return super.addMesh(mesh);
    }
}
