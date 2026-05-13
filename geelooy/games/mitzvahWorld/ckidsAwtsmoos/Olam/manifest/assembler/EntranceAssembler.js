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

import NivraAssembler from '../NivraAssembler/index.js';
import { ENTRANCE_MANIFEST } from '../blueprints/architecture/EntranceManifest.js';
import { ENTRANCE_POSITION_LOGIC } from '../blueprints/architecture/EntrancePositions.js';

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
        const context = {
            building,
            room,
            ent,
            idSuffix,
            roomOffset,
            // Pre-calculate the hinge position data using JSONEvaluator
            hinge: NivraAssembler.evaluate(logic, { room, ent })
        };

        // 3. Command the manifestation
        return await NivraAssembler.assemble(olam, ENTRANCE_MANIFEST, context);
    }
}
