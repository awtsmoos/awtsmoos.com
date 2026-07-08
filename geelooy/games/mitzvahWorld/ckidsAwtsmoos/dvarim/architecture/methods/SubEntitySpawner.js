import NpcAssembler from '../../../Olam/manifest/assembler/NpcAssembler.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import EntranceAssembler from '../../../Olam/manifest/assembler/EntranceAssembler.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import FurnitureAssembler from '../../../Olam/manifest/assembler/FurnitureAssembler.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class SubEntitySpawner {
    /**
     * @method spawnEntrances
     * @description Orchestrates the spawning of all sub-entities for a building.
     */
    static async spawnEntrances(building, blueprint) {
        const rooms = blueprint.rooms || [blueprint];
        const criticalPromises = [];
        const deferredFurniture = [];
        const allowFurniture = blueprint.spawnFurniture === true || building?.options?.spawnFurniture === true;
        const maxFurniture = Number.isFinite(blueprint.maxFurniture) ? blueprint.maxFurniture : 8;
        let furnitureCount = 0;

        const addCritical = (promise, label) => {
            criticalPromises.push(
                promise.catch(err => {
                    console.warn(`B"H - SubEntitySpawner: ${label} failed`, err);
                    return null;
                })
            );
        };

        const addFurniture = (factory) => {
            if (!allowFurniture || furnitureCount >= maxFurniture) return;
            furnitureCount++;
            deferredFurniture.push(factory);
        };

        // B"H: Process global JSON arrays
        if (blueprint.npcs) {
            blueprint.npcs.forEach((npcData, npcIdx) => {
                addCritical(
                    NpcAssembler.spawn(building, blueprint, npcData, `global_npc_${npcIdx}`, [0, 0, 0]),
                    `global NPC ${npcIdx}`
                );
            });
        }
        
        if (blueprint.furniture) {
            blueprint.furniture.forEach((furnData, fIdx) => {
                addFurniture(() => FurnitureAssembler.spawn(building, blueprint, furnData, `global_furn_${fIdx}`, [0, 0, 0]));
            });
        }

        rooms.forEach((room, roomIdx) => {
            const roomOffset = room.offset || [0, 0, 0];

            if (room.entrances) {
                room.entrances.forEach((ent, entIdx) => {
                    const id = `${roomIdx}_${entIdx}`;
                    addCritical(
                        EntranceAssembler.spawn(building, room, ent, id, roomOffset),
                        `entrance ${id}`
                    );
                });
            }

            if (room.npcs) {
                room.npcs.forEach((npcData, npcIdx) => {
                    addCritical(
                        NpcAssembler.spawn(building, room, npcData, `room_${roomIdx}_npc_${npcIdx}`, roomOffset),
                        `room ${roomIdx} NPC ${npcIdx}`
                    );
                });
            }
            
            if (room.furniture) {
                room.furniture.forEach((furnData, fIdx) => {
                    addFurniture(() => FurnitureAssembler.spawn(building, room, furnData, `room_${roomIdx}_furn_${fIdx}`, roomOffset));
                });
            }
        });

        await Promise.allSettled(criticalPromises);

        if (deferredFurniture.length) {
            setTimeout(() => {
                deferredFurniture.forEach(spawnFurniture => {
                    spawnFurniture().catch(err => {
                        console.warn("B\"H - SubEntitySpawner: deferred furniture failed", err);
                    });
                });
            }, 0);
        }
    }
}
