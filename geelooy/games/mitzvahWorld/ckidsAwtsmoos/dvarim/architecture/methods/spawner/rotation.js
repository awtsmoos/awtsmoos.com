// B"H
/**
 * @file rotation.js
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE WHEEL OF DIRECTION — Spatial Alignment                ║
 * ║                                                             ║
 * ║  "And the wheels were full of eyes round about..."        ║
 * ║  (Yechezkel 1:18)                                           ║
 * ║                                                             ║
 * ║  Aligns sub-entities with the building's rotation/position.║
 * ╚═══════════════════════════════════════════════════════════╝
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    _applyBuildingRotation(pos, building) {
        if (!building.rotation) return;
        pos.applyEuler(new THREE.Euler(
            building.rotation.x || 0,
            building.rotation.y || 0,
            building.rotation.z || 0
        ));
    },

    _applyBuildingPosition(pos, building) {
        if (building.mesh && building.mesh.position) {
            pos.add(building.mesh.position);
        } else if (building.position) {
            const vecBase = building.position.vector3
                ? building.position.vector3()
                : building.position;
            pos.add(vecBase);
        }
    }
};
