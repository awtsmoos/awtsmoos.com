
// B"H
/**
 * @file csg.js
 * @chapter THE PERSISTENCE OF THE NAME
 * 
 * THE HYMN OF THE TAGGED VOID:
 * When the Cutter enters the Stone, the Stone's internal walls are born
 * from the very skin of the Cutter itself! 
 * We decree that these new walls shall not be anonymous ghosts,
 * but shall inherit the 'shared' tags (the Name) of the Cutter.
 * This allows the Golem to remember which part of the void 
 * belongs to the Upper and which to the Lower realms!
 * 
 * @module CSG
 */

import { Tree } from './bsp/tree.js';
import { meshToPolygons, polygonsToMesh } from './utils/meshUtils.js';

export class CSG {
    constructor() { this.polygons =[]; }

    static fromPolygons(polygons) {
        const csg = new CSG();
        csg.polygons = polygons;
        return csg;
    }

    static fromMesh(renderData) {
        if (!renderData) return new CSG();
        return CSG.fromPolygons(meshToPolygons(renderData));
    }

    toMesh() { return polygonsToMesh(this.polygons); }

    clone() {
        const csg = new CSG();
        csg.polygons = this.polygons.map(p => p.clone());
        return csg;
    }

    union(csg) {
        let polygonsA = this.clone().polygons;
        let polygonsB = csg.clone().polygons;
        const treeA = new Tree(this.polygons);
        const treeB = new Tree(csg.polygons);
        treeB.clipPolygons(polygonsA, false); 
        treeA.clipPolygons(polygonsB, false); 
        return CSG.fromPolygons(polygonsA.concat(polygonsB));
    }

    /**
     * B"H - THE REFINED SUBTRACTION (A - B)
     * Now preserves the internal tags of the cutter (B).
     */
    subtract(csg, insideTag = null) {
        console.log(`B"H - ✂️ [CSG::Subtract]: Performing binary division...`);
        let polygonsA = this.clone().polygons;
        let polygonsB = csg.clone().polygons;
        
        const treeA = new Tree(this.polygons);
        const treeB = new Tree(csg.polygons);

        // 1. Clip A by B. Keep parts of A that are OUTSIDE B.
        treeB.clipPolygons(polygonsA, false); 
        
        // 2. Clip B by A. Keep parts of B that are INSIDE A.
        treeA.clipPolygons(polygonsB, true);
        
        // 3. The cutter polygons (B) that are inside A become our new inner walls.
        polygonsB.forEach(p => {
            p.flip();
            // B"H - CRITICAL: We keep the existing tags (Upper/Lower) 
            // and optionally append a global 'insideTag'.
            if (insideTag) {
                if (!p.shared) p.shared =[];
                if (!p.shared.includes(insideTag)) p.shared.push(insideTag);
            }
        });
        
        console.log(`      -> 🏁 Subtraction complete. Resulting in ${polygonsA.length + polygonsB.length} polygons.`);
        return CSG.fromPolygons(polygonsA.concat(polygonsB));
    }

    intersect(csg) {
        let polygonsA = this.clone().polygons;
        let polygonsB = csg.clone().polygons;
        const treeA = new Tree(this.polygons);
        const treeB = new Tree(csg.polygons);
        treeB.clipPolygons(polygonsA, true); 
        treeA.clipPolygons(polygonsB, true); 
        return CSG.fromPolygons(polygonsA.concat(polygonsB));
    }
}
