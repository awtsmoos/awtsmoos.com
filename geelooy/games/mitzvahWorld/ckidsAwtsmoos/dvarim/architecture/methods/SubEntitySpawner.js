
// B"H
/**
 * @module SubEntitySpawner
 * @description
 * Carves out InteractiveDoor elements along the edges of the walls of a given ProceduralBuilding.
 */

import * as THREE from '/games/scripts/build/three.module.js';

export default class SubEntitySpawner {
    static async spawnEntrances(building, blueprint) {
        const entrances = blueprint.entrances || [];
        const w = blueprint.width;
        const d = blueprint.depth;
        const t = blueprint.wallThickness;
        const olam = building.olam;

        console.log("B\"H - ⚡ Architecting Doors for building...", entrances);

        const buildPromises = entrances.map(async (ent, i) => {
            const doorData = ent.doorData || {};
            const doorId = `${building.id}_door_${i}_${Date.now()}`;
            
            let rx = 0, ry = 0, rz = 0;
            let rotY = 0;
            
            // Align localized origin points
            if (ent.wall === 'front') { rx = ent.offset; rz = d/2 - t/2; rotY = 0; }
            else if (ent.wall === 'back') { rx = -ent.offset; rz = -d/2 + t/2; rotY = Math.PI; }
            else if (ent.wall === 'left') { rx = -w/2 + t/2; rz = -ent.offset; rotY = -Math.PI/2; }
            else if (ent.wall === 'right') { rx = w/2 - t/2; rz = ent.offset; rotY = Math.PI/2; }

            const dummy = new THREE.Object3D();
            dummy.position.set(rx, ry, rz);
            dummy.rotation.y = rotY;
            dummy.updateMatrix();
            
            // Hinge Alignment
            dummy.translateX(-ent.width / 2);
            
            const finalPos = dummy.position.clone();
            if (building.rotation) {
                // Determine absolute Vector orientation before parsing into finalPos
                let rX = building.rotation.x || 0;
                let rY = building.rotation.y || 0;
                let rZ = building.rotation.z || 0;
                finalPos.applyEuler(new THREE.Euler(rX, rY, rZ));
            }
            
            if (building.position) {
                const vecBase = building.position.vector3 ? building.position.vector3() : building.position;
                finalPos.add(vecBase);
            }

            const finalRotY = (building.rotation ? (building.rotation.y || 0) : 0) + rotY;

            // Wait for door manifestation
            const resultNivra = await olam.addObject("InteractiveDoor", {
                id: doorId,
                name: doorData.name || "House Doorway",
                golem: {
                    guf: { DoorGeometry: [ent.width, ent.height, t * 0.8] },
                    toyr: { 
                        MaterialArray: doorData.materials || [
                            { AwtsmoosWoodMaterial: { color: "#4e342e" } }, 
                            { MeshStandardMaterial: { color: "#FFD700", metalness: 1.0, roughness: 0.1 } } 
                        ]
                    } 
                },
                position: { x: finalPos.x, y: finalPos.y, z: finalPos.z },
                rotation: { x: 0, y: finalRotY, z: 0 },
                isSolid: true,
                interactable: true,
                proximity: 8
            });
            
            console.log(`B"H - ⚡ Gateway [${doorId}] embedded perfectly onto the structure.`);
            return resultNivra;
        });

        await Promise.all(buildPromises);
    }
}
