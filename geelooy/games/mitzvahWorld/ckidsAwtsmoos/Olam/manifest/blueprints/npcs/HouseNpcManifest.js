// B"H
/**
 * @file HouseNpcManifest.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE MANIFEST OF THE SOUL — NPC Data Logic                               ║
 * ║                                                                          ║
 * ║  "And man became a living soul..." (Bereishis 2:7)                       ║
 * ║                                                                          ║
 * ║  A purely data-driven description of how NPCs are born in the house.     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

export const HOUSE_NPC_MANIFEST = {
    "emanations": [
        {
            "type": "InteractiveNpc",
            "name": { "$var": "npcData.name" },
            "position": {
                "x": { "$var": "npcData.x" },
                "y": { "$mul": [ { "$var": "room.height" }, 0.3 ] },
                "z": { "$var": "npcData.z" }
            },
            "rotation": { "$var": "building.rotation" },
            "dialogues": { "$var": "npcData.dialogues" },
            "hasMission": { "$var": "npcData.hasMission" },
            "missionData": { "$var": "npcData.missionData" },
            "hasShop": { "$var": "npcData.hasShop" }
        }
    ]
};
