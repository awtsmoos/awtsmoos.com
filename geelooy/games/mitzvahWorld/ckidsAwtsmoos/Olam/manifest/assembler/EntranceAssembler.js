// B"H
/**
 * @file EntranceAssembler.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE ENTRANCE ASSEMBLER — Data-Driven Threshold Spawning                ║
 * ║                                                                          ║
 * ║  "Behold, I stand at the door..."                                        ║
 * ║                                                                          ║
 * ║  Uses the NivraAssembler to interpret the EntranceManifest.js            ║
 * ║  This replaces the imperative JS logic with pure data interpretation.    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import NivraAssembler from '../NivraAssembler/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { ENTRANCE_MANIFEST } from '../blueprints/architecture/EntranceManifest.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { ENTRANCE_POSITION_LOGIC } from '../blueprints/architecture/EntrancePositions.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class EntranceAssembler {
    /**
     * @method spawn
     * @description Orchestrates the manifestation of an entrance.
     */
    static async spawn(building, room, ent, idSuffix, roomOffset) {
        const olam = building.olam;
        
        // 1. Resolve the hinge logic (Pure Data)
        const logic = ENTRANCE_POSITION_LOGIC[ent.wall];
        if (!logic) return;

        // 2. Prepare the Sefirotic context (Variables)
        const hinge = NivraAssembler.evaluate(logic, { room, ent });
        const offset = Array.isArray(roomOffset) ? roomOffset : [0, 0, 0];
        hinge.hx = (Number(hinge.hx) || 0) + (Number(offset[0]) || 0);
        hinge.hy = (Number(hinge.hy) || 0) + (Number(offset[1]) || 0);
        hinge.hz = (Number(hinge.hz) || 0) + (Number(offset[2]) || 0);

        const context = {
            building,
            room,
            ent,
            idSuffix,
            roomOffset,
            parent: building,
            // Pre-calculate the hinge position data using JSONEvaluator
            hinge
        };

        // 3. Command the manifestation
        return await NivraAssembler.assemble(olam, ENTRANCE_MANIFEST, context);
    }
}
