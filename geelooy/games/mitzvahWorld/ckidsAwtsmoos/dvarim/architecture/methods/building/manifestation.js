// B"H
/**
 * @file manifestation.js
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE BRINGING INTO BEING — Manifestation Flow              ║
 * ║                                                             ║
 * ║  "In the beginning..."                                      ║
 * ║                                                             ║
 * ║  Coordinates the geometry, physics, and sub-entities.      ║
 * ╚═══════════════════════════════════════════════════════════╝
 */
import * as THREE from '/games/scripts/build/three.module.js';
import HouseAssembler from '../../../../utils/3d/procedural/house/HouseAssembler.js';
import SubEntitySpawner from '../SubEntitySpawner.js';

export default {
    /**
     * @method manifest
     * @description Core manifestation pipeline.
     */
    async manifest(building) {
        const blueprint = building.blueprint;
        const olam      = building.olam;

        try {
            const geo = HouseAssembler.generateFromBlueprint(blueprint);
            const materials = await this.loadBuildingMaterials(olam);
            const mesh = new THREE.Mesh(geo, materials);

            mesh.name = building.name || 'Building';
            building.mesh = mesh;
            mesh.nivraAwtsmoos = building;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const p = building.position?.vector3 ? building.position.vector3() : building.position;
            if (p) mesh.position.set(p.x || 0, p.y || 0, p.z || 0);

            const r = building.rotation;
            if (r) mesh.rotation.set(r.x || 0, r.y || 0, r.z || 0);

            olam.nivrayimGroup.add(mesh);
            mesh.updateWorldMatrix(true, true);
            mesh.userData.isSolid    = true;
            mesh.userData.isBuilding = true;

            this._groundBuilding(olam, mesh, blueprint);
            mesh.updateWorldMatrix(true, false);

            if (olam.worldOctree?.addObject) {
                const added = olam.worldOctree.addObject(mesh);
                if (!added) console.warn(`B"H - 🚨 Building [${mesh.name}] rejected by Octree!`);
                
                if (typeof olam.worldOctree._processQueues === 'function') {
                    olam.worldOctree._processQueues(true);
                }
            }

            await SubEntitySpawner.spawnEntrances(building, blueprint);
            building.isReady = true;

        } catch (err) {
            console.error('B"H - Building failed:', building.name, err?.message || err);
        }
    }
};
