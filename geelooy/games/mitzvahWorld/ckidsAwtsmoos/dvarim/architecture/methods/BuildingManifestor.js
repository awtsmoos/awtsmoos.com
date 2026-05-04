// B"H

/**
 * @file BuildingManifestor.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE ARCHITECT OF DWELLINGS — BuildingManifestor (Fixed)                 ║
 * ║  "And let them make Me a sanctuary..." (Shemos 25:8)                     ║
 * ║                                                                          ║
 * ║  Fix: worldOctree.rayIntersect(ray) requires a THREE.Ray object with     ║
 * ║  `.intersectsBox()`. Plain data objects lack this method → crash.        ║
 * ║  Now uses a proper THREE.Ray via THREE import (Three is available in      ║
 * ║  the worker). Wrapped in try/catch so grounding failure never kills       ║
 * ║  the building — it simply places at the world-data Y position.           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
import * as THREE from '/games/scripts/build/three.module.js';
import HouseAssembler from '../../../utils/3d/procedural/house/HouseAssembler.js';
import SubEntitySpawner from './SubEntitySpawner.js';

// ── Single shared objects (no per-call allocation) ─────────────────────────
const _ray      = new THREE.Ray();
const _rayDown  = new THREE.Vector3(0, -1, 0);
const _rayOrigin = new THREE.Vector3();

// ── Footprint offsets as fractions of half-extents ─────────────────────────
const FOOTPRINT = [
    [  0.0,  0.0 ],
    [  0.8,  0.8 ],
    [ -0.8,  0.8 ],
    [  0.8, -0.8 ],
    [ -0.8, -0.8 ],
];

export default class BuildingManifestor {

    /**
     * @method findTerrainHeightAt
     * @description
     * Casts a downward THREE.Ray against the worldOctree at (x, z).
     * Returns terrain Y or null. Never throws — all errors return null.
     *
     * @param {Object} olam
     * @param {number} x
     * @param {number} z
     * @returns {number|null}
     */
    static findTerrainHeightAt(olam, x, z) {
        try {
            if (!olam?.worldOctree?.rayIntersect) return null;
            _rayOrigin.set(x, 500, z);
            _ray.origin.copy(_rayOrigin);
            _ray.direction.copy(_rayDown);
            const hit = olam.worldOctree.rayIntersect(_ray);
            return hit?.position?.y ?? null;
        } catch (_e) {
            return null;
        }
    }

    /**
     * @method _groundBuilding
     * @description Samples 5 footprint points and snaps mesh Y to the max height.
     */
    static _groundBuilding(olam, mesh, blueprint) {
        const halfW = (blueprint.width  || 12) / 2;
        const halfD = (blueprint.depth  || 12) / 2;
        const cx    = mesh.position.x;
        const cz    = mesh.position.z;
        let   maxH  = -Infinity;

        for (const [fx, fz] of FOOTPRINT) {
            const h = this.findTerrainHeightAt(olam, cx + fx * halfW, cz + fz * halfD);
            if (h !== null && h > maxH) maxH = h;
        }

        if (maxH !== -Infinity) mesh.position.y = maxH;
    }

    /**
     * @method manifest
     * @description Full building pipeline: generate → ground → physics → doors.
     */
    static async manifest(building) {
        const blueprint = building.blueprint;
        const olam      = building.olam;

        const golem = {
            guf: { BoxGeometry: [1, 1, 1] },
            toyr: {
                MaterialArray: blueprint.materials || [
                    { AwtsmoosBrickMaterial: { color: '#a0522d' } },
                    { AwtsmoosWoodMaterial:  { color: '#443322' } },
                    { MeshStandardMaterial:  { color: '#3d3d3d', roughness: 0.9 } },
                    { AwtsmoosFloorMaterial: { color: '#e3d5c8' } }
                ]
            },
            textureRepeat: blueprint.textureRepeat || { x: 1, y: 1 }
        };

        try {
            const mesh = await olam.generateThreeJsMesh(golem);
            mesh.geometry = HouseAssembler.generateFromBlueprint(blueprint);
            mesh.name     = building.name || 'Building';
            building.mesh = mesh;
            mesh.nivraAwtsmoos = building;

            if (building.position) {
                const p = typeof building.position.vector3 === 'function'
                    ? building.position.vector3()
                    : building.position;
                mesh.position.set(p.x || 0, p.y || 0, p.z || 0);
            }
            if (building.rotation) {
                mesh.rotation.set(
                    building.rotation.x || 0,
                    building.rotation.y || 0,
                    building.rotation.z || 0
                );
            }

            // B"H: Ground — if octree ray fails, mesh stays at data-Y
            this._groundBuilding(olam, mesh, blueprint);

            mesh.updateMatrix();
            mesh.updateMatrixWorld(true);
            mesh.userData.isSolid    = true;
            mesh.userData.isBuilding = true;

            if (olam.worldOctree?.addObject) olam.worldOctree.addObject(mesh);
            olam.nivrayimGroup.add(mesh);

            await SubEntitySpawner.spawnEntrances(building, blueprint);
            building.isReady = true;

        } catch (err) {
            // B"H: Silent failure — building missing is better than crash
            console.error('B"H - Building failed:', building.name, err.message);
        }
    }
}
