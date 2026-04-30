
// B"H
import HouseAssembler from "../../../utils/3d/procedural/house/HouseAssembler.js";
import SubEntitySpawner from "./SubEntitySpawner.js";
import * as THREE from '/games/scripts/build/three.module.js';

export default class BuildingManifestor {
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
            
            mesh.updateMatrixWorld(true);
            mesh.userData.isSolid = true;
            mesh.userData.isTerrain = true; 

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
