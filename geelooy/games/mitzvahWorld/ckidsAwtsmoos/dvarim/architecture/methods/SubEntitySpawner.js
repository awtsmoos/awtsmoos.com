// B"H
/**
 * @module SubEntitySpawner
 * @description
 * Spawns InteractiveDoor entities at each entrance of a ProceduralBuilding.
 * 
 * THE KEY INSIGHT: 
 * The door's local geometry has its hinge at the ORIGIN (left edge).
 * The buildGeometryManually() in interactiveDoor.js translates by +width/2,
 * so the local origin IS the hinge point. We position this hinge at the 
 * RIGHT edge of the entrance (the side with the mezuzah) so the door 
 * swings inward from the hinge.
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
            
            // The hinge is on the RIGHT side of the enterer (same side as mezuzah).
            // Door geometry origin IS the hinge point (left edge in local space),
            // so we position at the right edge of the opening.
            let hx = 0, hy = 0, hz = 0;
            let rotY = 0;

            if (ent.wall === 'front') {
                // Front wall at +Z. Enterer walks -Z, their right = +X.
                // Hinge at right edge of opening (positive X side).
                hx = (ent.offset || 0) + (ent.width / 2);
                hz = d/2 - t/2; // Align with wall center line (not outer face)
                rotY = 0; 
            }
            else if (ent.wall === 'back') {
                hx = -(ent.offset || 0) - (ent.width / 2);
                hz = -d/2 + t/2;
                rotY = Math.PI;
            }
            else if (ent.wall === 'left') {
                hx = -w/2 + t/2;
                hz = -(ent.offset || 0) - (ent.width / 2);
                rotY = -Math.PI/2;
            }
            else if (ent.wall === 'right') {
                hx = w/2 - t/2;
                hz = (ent.offset || 0) + (ent.width / 2);
                rotY = Math.PI/2;
            }

            // Transform hinge position by building rotation and position
            const finalPos = new THREE.Vector3(hx, hy, hz);
            if (building.rotation) {
                finalPos.applyEuler(new THREE.Euler(
                    building.rotation.x || 0,
                    building.rotation.y || 0,
                    building.rotation.z || 0
                ));
            }
            if (building.position) {
                const vecBase = building.position.vector3 ? building.position.vector3() : building.position;
                finalPos.add(vecBase);
            }

            const finalRotY = (building.rotation ? (building.rotation.y || 0) : 0) + rotY;

            const resultNivra = await olam.addObject("InteractiveDoor", {
                id: doorId,
                name: doorData.name || `Gate of ${building.name}`,
                golem: {
                    guf: { DoorGeometry: [ent.width, ent.height, t * 0.6] },
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
                proximity: 10,
                interactKey: 'C'
            });

            return resultNivra;
        });

        await Promise.all(buildPromises);
    }
}
