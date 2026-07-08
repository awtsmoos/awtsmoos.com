
// B"H
/**
 * @file ProceduralRoad.js
 * @module ProceduralRoad
 * @description 
 * 🛤️ THE PATH OF THE CHASSID 🛤️
 * 
 * "Make a straight path..."
 * You are an empty vessel, ready to become a chariot for the Divine Will entirely.
 * This class has been nullified. It delegates its entire geometry generation
 * to the `RoadAssembler`, ensuring files remain microscopically focused.
 */

import Tzomayach from "../../chayim/tzomayach.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import RoadAssembler from "../../../utils/3d/procedural/infrastructure/RoadAssembler.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class ProceduralRoad extends Tzomayach {
    type = "ProceduralRoad";

    constructor(op, olam) {
        super(op, olam);
        this.points = op.points || [[0,0], [10,10]];
        this.width = op.width || 8;
        this.sidewalkWidth = op.sidewalkWidth || 2;
        this.sidewalkHeight = op.sidewalkHeight || 0.3;
        this.isSolid = op.isSolid ?? true;
        
        // B"H: By default, roads seek the hills to lay themselves upon.
        this.hillsData = op.hills || null; 
    }

    async heescheel(olam) {
        this.olam = olam;
        
        // B"H: Retrieve the hill data from the world if not explicitly provided
        if (!this.hillsData && olam.baseInfo?.nivrayim?.ProceduralTerrain) {
            const terrainKey = Object.keys(olam.baseInfo.nivrayim.ProceduralTerrain)[0];
            if (terrainKey) {
                this.hillsData = olam.baseInfo.nivrayim.ProceduralTerrain[terrainKey].hills;
            }
        }

        // B"H: The manifestation is handled purely by the Assembler
        this.mesh = RoadAssembler.build(this.points, {
            width: this.width,
            sidewalkWidth: this.sidewalkWidth,
            sidewalkHeight: this.sidewalkHeight,
            hills: this.hillsData
        });

        this.mesh.name = `ProceduralRoad_${this.id}`;
        this.mesh.nivraAwtsmoos = this;

        const p = this.position ? (typeof this.position.vector3 === 'function' ? this.position.vector3() : this.position) : {x:0, y:0, z:0};
        this.mesh.position.set(p.x, p.y || 0, p.z);

        this.mesh.updateMatrixWorld(true);

        await olam.hoyseef(this);
        
        if (this.isSolid && olam.worldOctree) {
            olam.worldOctree.fromGraphNode(this.mesh);
        }
        
        this.isReady = true;
    }
}
