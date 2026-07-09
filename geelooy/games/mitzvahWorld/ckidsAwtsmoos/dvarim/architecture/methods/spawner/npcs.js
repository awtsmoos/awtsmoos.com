// B"H
/**
 * @file npcs.js
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE BREATH OF LIFE — NPC Manifestation                     ║
 * ║                                                             ║
 * ║  "And man became a living soul..."                         ║
 * ║  (Bereishis 2:7)                                            ║
 * ║                                                             ║
 * ║  Populates the dwellings with soulful messengers.           ║
 * ╚═══════════════════════════════════════════════════════════╝
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default {
    async _spawnHouseNpc(building, room, npcData, idSuffix, roomOffset) {
        const olam = building.olam;
        const houseHeight = room.height || 8;
        const initialFallHeight = houseHeight * 0.3; 
        
        const localPos = new THREE.Vector3(
            npcData.x || 0,
            initialFallHeight,
            npcData.z || 0
        );

        localPos.add(new THREE.Vector3(...roomOffset));

        this._applyBuildingRotation(localPos, building);
        this._applyBuildingPosition(localPos, building);

        const dialogues = npcData.dialogues || ["B\"H! Everything is created from the Speech of the Essence."];

        await olam.addObject("InteractiveNpc", {
            id: `${building.id}_npc_${idSuffix}`,
            name: npcData.name || `Messenger`,
            position: { x: localPos.x, y: localPos.y, z: localPos.z },
            rotation: building.rotation || { x: 0, y: 0, z: 0 },
            dialogues: dialogues,
            hasMission: npcData.hasMission,
            missionData: npcData.missionData,
            hasShop: npcData.hasShop
        });
    }
};
