
// B"H
import HouseAssembler from "../../../utils/3d/procedural/house/HouseAssembler.js";
import SubEntitySpawner from "./SubEntitySpawner.js";
import * as THREE from '/games/scripts/build/three.module.js';

export default class BuildingManifestor {
    /**
     * Raycasts downward from a position to find the terrain height at that XZ point.
     * Returns the world Y coordinate of the terrain surface, or null if no terrain found.
     */
    static findTerrainHeight(olam, x, z, startY = 200) {
        const raycaster = new THREE.Raycaster();
        raycaster.set(
            new THREE.Vector3(x, startY, z),
            new THREE.Vector3(0, -1, 0)
        );
        raycaster.far = 500;

        // Only intersect terrain meshes
        const candidates = [];
        olam.scene.traverse(child => {
            if (child.isMesh && child.userData && child.userData.isTerrain && !child.userData.isBuilding) {
                candidates.push(child);
            }
        });

        if (candidates.length === 0) {
            // Fallback: try all meshes in nivrayimGroup
            if (olam.nivrayimGroup) {
                olam.nivrayimGroup.traverse(child => {
                    if (child.isMesh && !child.userData.isBuilding) {
                        candidates.push(child);
                    }
                });
            }
        }

        const hits = raycaster.intersectObjects(candidates, false);
        if (hits.length > 0) {
            return hits[0].point.y;
        }
        return null;
    }

    /**
     * Flattens the terrain geometry beneath a building footprint.
     * This modifies the terrain mesh's vertex positions so the area
     * under the building is level — like excavating a foundation in real life.
     */
    static flattenTerrainUnder(olam, buildingMesh, blueprint) {
        const w = blueprint.width || 12;
        const d = blueprint.depth || 12;
        const margin = 1.5; // Extra padding around the building
        const bPos = buildingMesh.position;

        olam.scene.traverse(child => {
            if (!child.isMesh || !child.userData.isTerrain || child.userData.isBuilding) return;
            
            const geo = child.geometry;
            if (!geo || !geo.attributes || !geo.attributes.position) return;

            const pos = geo.attributes.position;
            const worldMatrix = child.matrixWorld;
            const inverseMatrix = new THREE.Matrix4().copy(worldMatrix).invert();
            
            // Convert building position to terrain's local space
            const localBuildingPos = bPos.clone().applyMatrix4(inverseMatrix);
            const targetY = localBuildingPos.y;

            let modified = false;
            const halfW = (w / 2) + margin;
            const halfD = (d / 2) + margin;

            for (let i = 0; i < pos.count; i++) {
                const vx = pos.getX(i);
                const vz = pos.getZ(i);

                const dx = Math.abs(vx - localBuildingPos.x);
                const dz = Math.abs(vz - localBuildingPos.z);

                if (dx <= halfW && dz <= halfD) {
                    // Inside the building footprint — flatten to building base height
                    pos.setY(i, targetY);
                    modified = true;
                } else if (dx <= halfW + margin * 2 && dz <= halfD + margin * 2) {
                    // In the transition zone — lerp between terrain height and building height
                    const blendX = dx > halfW ? (dx - halfW) / (margin * 2) : 0;
                    const blendZ = dz > halfD ? (dz - halfD) / (margin * 2) : 0;
                    const blend = Math.max(blendX, blendZ);
                    const currentY = pos.getY(i);
                    pos.setY(i, currentY * blend + targetY * (1 - blend));
                    modified = true;
                }
            }

            if (modified) {
                pos.needsUpdate = true;
                geo.computeVertexNormals();

                // Re-register terrain with the octree so collision matches the flattened surface
                if (olam.worldOctree && typeof olam.worldOctree.removeMesh === 'function') {
                    olam.worldOctree.removeMesh(child);
                }
                child.updateMatrixWorld(true);
                if (olam.worldOctree) {
                    olam.worldOctree.addObject(child);
                }
            }
        });
    }

    static async manifest(building) {
        const blueprint = building.blueprint;
        const olam = building.olam;

        const golem = {
            guf: { BoxGeometry: [1, 1, 1] },
            toyr: {
                MaterialArray: blueprint.materials || [
                    { AwtsmoosBrickMaterial: { color: "#a0522d" } },
                    { AwtsmoosWoodMaterial: { color: "#443322" } } 
                ]
            },
            textureRepeat: blueprint.textureRepeat || { x: 1, y: 1 }
        };

        try {
            const mesh = await olam.generateThreeJsMesh(golem);
            mesh.geometry = HouseAssembler.generateFromBlueprint(blueprint);
            
            mesh.name = building.name;
            building.mesh = mesh;
            mesh.nivraAwtsmoos = building;

            if (building.position) mesh.position.copy(building.position.vector3 ? building.position.vector3() : building.position);
            if (building.rotation) mesh.rotation.set(building.rotation.x || 0, building.rotation.y || 0, building.rotation.z || 0);
            
            // B"H: Ground Alignment System
            // Raycast down to find the terrain surface and place the building on it.
            // Then flatten the terrain underneath so it looks naturally excavated.
            const terrainY = this.findTerrainHeight(olam, mesh.position.x, mesh.position.z);
            if (terrainY !== null) {
                // Place the building so its bottom sits on the terrain
                mesh.position.y = terrainY;
                console.log(`B"H - ⚓ [${building.name}] grounded to terrain at Y: ${terrainY.toFixed(2)}`);
            }

            mesh.updateMatrixWorld(true);
            mesh.userData.isSolid = true;
            mesh.userData.isTerrain = true; 
            mesh.userData.isBuilding = true;

            // Flatten terrain under the building BEFORE adding to octree
            this.flattenTerrainUnder(olam, mesh, blueprint);

            // Manifest in physics realm!
            await olam.worldOctree.addObject(mesh);
            olam.nivrayimGroup.add(mesh);
            
            // B"H: Await the birth of the threshold vessels!
            await SubEntitySpawner.spawnEntrances(building, blueprint);

            building.isReady = true;
            
        } catch(err) {
             console.error("B\"H - Massive failure in Building Manifestation:", err);
        }
    }
}
