// B"H
/**
 * @file grounding.js
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE GROUNDING OF THE TABERNACLE — Terrain Alignment       ║
 * ║                                                             ║
 * ║  "He established the world upon its foundations."          ║
 * ║  (Tehillim 104:5)                                           ║
 * ║                                                             ║
 * ║  This module ensures every building is physically rooted    ║
 * ║  in the terrain of the Emerald Void.                        ║
 * ╚═══════════════════════════════════════════════════════════╝
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

const _ray      = new THREE.Ray();
const _rayDown  = new THREE.Vector3(0, -1, 0);
const _rayOrigin = new THREE.Vector3();

const FOOTPRINT = [
    [  0.0,  0.0 ],
    [  0.8,  0.8 ],
    [ -0.8,  0.8 ],
    [  0.8, -0.8 ],
    [ -0.8, -0.8 ],
];

export default {
    /**
     * @method findTerrainHeightAt
     * @description Casts a downward ray to find the ground.
     */
    findTerrainHeightAt(olam, x, z) {
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
    },

    /**
     * @method _groundBuilding
     * @description Samples the footprint to find the highest point.
     */
    _groundBuilding(olam, mesh, blueprint) {
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
};
