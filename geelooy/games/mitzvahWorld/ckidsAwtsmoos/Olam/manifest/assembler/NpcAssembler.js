// B"H
/**
 * @file NpcAssembler.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE NPC ASSEMBLER — Data-Driven Soul Manifestation                      ║
 * ║                                                                          ║
 * ║  "Blessed is He who forms man..."                                       ║
 * ║                                                                          ║
 * ║  Uses the NivraAssembler to interpret the HouseNpcManifest.js            ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import NivraAssembler from '../NivraAssembler/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { HOUSE_NPC_MANIFEST } from '../blueprints/npcs/HouseNpcManifest.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class NpcAssembler {
    /**
     * @method spawn
     * @description Orchestrates the manifestation of an NPC.
     */
    static async spawn(building, room, npcData, idSuffix, roomOffset) {
        const olam = building.olam;
        
        // B"H: Apply the room offset to the NPC's raw local coordinates
        const adjustedNpcData = {
            ...npcData,
            x: (npcData.x || 0) + roomOffset[0],
            y: (npcData.y || 0) + roomOffset[1],
            z: (npcData.z || 0) + roomOffset[2]
        };

        const context = {
            building,
            parent: building, // B"H: Tells NivraAssembler to transform relative to the building!
            room,
            npcData: adjustedNpcData,
            idSuffix,
            roomOffset
        };

        return await NivraAssembler.assemble(olam, HOUSE_NPC_MANIFEST, context);
    }
}
