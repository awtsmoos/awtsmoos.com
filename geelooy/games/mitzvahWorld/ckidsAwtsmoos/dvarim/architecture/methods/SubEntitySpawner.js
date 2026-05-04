// B"H

import * as THREE from '/games/scripts/build/three.module.js';
import ENTRANCE_POSITIONS from '../../../utils/3d/procedural/house/data/EntrancePositionMap.js';

export default class SubEntitySpawner {

    /**
     * @method spawnEntrances
     * @description
     * Spawns sub-entities (doors, mezuzahs, NPCs) for all rooms in a building.
     */
    static async spawnEntrances(building, blueprint) {
        const rooms = blueprint.rooms || [blueprint];
        const olam = building.olam;

        // B"H: silent


        const allPromises = [];

        rooms.forEach((room, roomIdx) => {
            const roomOffset = room.offset || [0, 0, 0];

            // ── SPAWN DOORS & MEZUZAHS ──
            if (room.entrances) {
                room.entrances.forEach((ent, entIdx) => {
                    allPromises.push(SubEntitySpawner._spawnSingleDoor(building, room, ent, `${roomIdx}_${entIdx}`, roomOffset));
                    allPromises.push(SubEntitySpawner._spawnMezuzah(building, room, ent, `${roomIdx}_${entIdx}`, roomOffset));
                });
            }

            // ── SPAWN NPCs ──
            if (room.npcs) {
                room.npcs.forEach((npcData, npcIdx) => {
                    allPromises.push(SubEntitySpawner._spawnHouseNpc(building, room, npcData, `${roomIdx}_${npcIdx}`, roomOffset));
                });
            }
        });

        await Promise.all(allPromises);
    }

    static async _spawnMezuzah(building, room, ent, idSuffix, roomOffset) {
        const olam = building.olam;
        const positionFn = ENTRANCE_POSITIONS[ent.wall];
        if (!positionFn) return;

        const doorData = positionFn(ent, room);
        const mezuzahPos = new THREE.Vector3(
            doorData.hx + (ent.width * 0.45), 
            doorData.hy + (ent.height * 0.65), 
            doorData.hz + 0.1
        );

        // Apply room offset
        mezuzahPos.add(new THREE.Vector3(...roomOffset));

        SubEntitySpawner._applyBuildingRotation(mezuzahPos, building);
        SubEntitySpawner._applyBuildingPosition(mezuzahPos, building);

        const buildingRotY = building.rotation ? (building.rotation.y || 0) : 0;
        const finalRotY = buildingRotY + doorData.rotY;

        return await olam.addObject("Domem", {
            id: `${building.id}_mezuzah_${idSuffix}`,
            name: "Mezuzah",
            golem: {
                guf: { BoxGeometry: [0.15, 0.5, 0.1] },
                toyr: { MeshStandardMaterial: { color: "#FFD700", metalness: 0.8, roughness: 0.2 } }
            },
            position: { x: mezuzahPos.x, y: mezuzahPos.y, z: mezuzahPos.z },
            rotation: { x: 0, y: finalRotY, z: 0 },
            isSolid: false
        });
    }

    static async _spawnHouseNpc(building, room, npcData, idSuffix, roomOffset) {
        const olam = building.olam;
        const houseHeight = room.height || 8;
        const initialFallHeight = houseHeight * 0.3; 
        
        const localPos = new THREE.Vector3(
            npcData.x || 0,
            initialFallHeight,
            npcData.z || 0
        );

        // Apply room offset
        localPos.add(new THREE.Vector3(...roomOffset));

        SubEntitySpawner._applyBuildingRotation(localPos, building);
        SubEntitySpawner._applyBuildingPosition(localPos, building);

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

    static async _spawnSingleDoor(building, room, ent, idSuffix, roomOffset) {
        const olam = building.olam;
        const positionFn = ENTRANCE_POSITIONS[ent.wall];
        if (!positionFn) return;

        const hingeData = positionFn(ent, room);
        const finalPos = new THREE.Vector3(hingeData.hx, hingeData.hy, hingeData.hz);

        // Apply room offset
        finalPos.add(new THREE.Vector3(...roomOffset));

        SubEntitySpawner._applyBuildingRotation(finalPos, building);
        SubEntitySpawner._applyBuildingPosition(finalPos, building);

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
            proximity: 5.0, 
            isLocked: building.isLocked,
            keyId: building.keyId
        });
    }

    static _applyBuildingRotation(pos, building) {
        if (!building.rotation) return;
        pos.applyEuler(new THREE.Euler(
            building.rotation.x || 0,
            building.rotation.y || 0,
            building.rotation.z || 0
        ));
    }

    static _applyBuildingPosition(pos, building) {
        if (building.mesh && building.mesh.position) {
            pos.add(building.mesh.position);
        } else if (building.position) {
            const vecBase = building.position.vector3
                ? building.position.vector3()
                : building.position;
            pos.add(vecBase);
        }
    }
}
