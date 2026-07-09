// B"H
/**
 * @file doors.js
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE GATES OF THE DWELLING — Door Manifestation            ║
 * ║                                                             ║
 * ║  "Open for me the gates of righteousness..."              ║
 * ║  (Tehillim 118:19)                                          ║
 * ║                                                             ║
 * ║  Spawns interactive doors at the designated entrances.     ║
 * ╚═══════════════════════════════════════════════════════════╝
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import ENTRANCE_POSITIONS from '../../../../utils/3d/procedural/house/data/EntrancePositionMap.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    async _spawnSingleDoor(building, room, ent, idSuffix, roomOffset) {
        const olam = building.olam;
        const positionFn = ENTRANCE_POSITIONS[ent.wall];
        if (!positionFn) return;

        const hingeData = positionFn(ent, room);
        const finalPos = new THREE.Vector3(hingeData.hx, hingeData.hy, hingeData.hz);

        finalPos.add(new THREE.Vector3(...roomOffset));

        this._applyBuildingRotation(finalPos, building);
        this._applyBuildingPosition(finalPos, building);

        const buildingRotY = building.rotation ? (building.rotation.y || 0) : 0;
        const finalRotY = buildingRotY + hingeData.rotY;

        const doorWidth = ent.width || 4;
        const doorHeight = ent.height || 5.5;

        return await olam.addObject("InteractiveDoor", {
            id: `${building.id}_door_${idSuffix}`,
            name: ent.name || `Gate`,
            golem: {
                guf: { DoorGeometry: [doorWidth * 0.98, doorHeight * 0.995, room.wallThickness || 1] },
                toyr: {
                    MaterialArray: [
                        { AwtsmoosWoodMaterial: { color: "#4e342e" } },
                        { MeshStandardMaterial: { color: "#FFD700", metalness: 1.0, roughness: 0.1 } }
                    ]
                }
            },
            position: { x: finalPos.x, y: finalPos.y, z: finalPos.z },
            rotation: { x: 0, y: finalRotY, z: 0 },
            isSolid: true,
            interactable: true,
            proximity: 80.0, // Increased for stability
            isLocked: building.isLocked,
            keyId: building.keyId
        });
    }
};
