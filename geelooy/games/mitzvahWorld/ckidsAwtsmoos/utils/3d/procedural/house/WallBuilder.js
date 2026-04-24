
/**
 * B"H
 * @module WallBuilder
 * @description
 * Builds the structural perimeter of a house using overlapping primitive BoxGeometries.
 * By avoiding complex extrusion algorithms, we guarantee that the Octree physics engine 
 * can perfectly calculate collisions for the interior space, allowing the soul to walk inside.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class WallBuilder {
    /**
     * @function build
     * @param {number} w - Width
     * @param {number} h - Height
     * @param {number} d - Depth
     * @param {number} t - Thickness
     * @param {number} doorW - Door Width
     * @param {number} doorH - Door Height
     * @returns {Array<THREE.BoxGeometry>} Array of wall geometries ready to be merged.
     */
    static build(w, h, d, t, doorW, doorH) {
        const walls = [];

        try {
            // 1. Back Wall (Solid)
            const backWall = new THREE.BoxGeometry(w, h, t);
            backWall.translate(0, h / 2, -d / 2);
            walls.push(backWall);

            // 2. Left Wall (Solid)
            const leftWall = new THREE.BoxGeometry(t, h, d);
            leftWall.translate(-w / 2, h / 2, 0);
            walls.push(leftWall);

            // 3. Right Wall (Solid)
            const rightWall = new THREE.BoxGeometry(t, h, d);
            rightWall.translate(w / 2, h / 2, 0);
            walls.push(rightWall);

            // 4. Front Wall (Divided for the Door)
            const sideWidth = (w - doorW) / 2;
            
            // Front Left
            const frontLeft = new THREE.BoxGeometry(sideWidth, h, t);
            frontLeft.translate(-w / 2 + sideWidth / 2, h / 2, d / 2);
            walls.push(frontLeft);
            
            // Front Right
            const frontRight = new THREE.BoxGeometry(sideWidth, h, t);
            frontRight.translate(w / 2 - sideWidth / 2, h / 2, d / 2);
            walls.push(frontRight);

            // 5. The Lintel (Above the door)
            const lintelHeight = h - doorH;
            if (lintelHeight > 0) {
                const lintel = new THREE.BoxGeometry(doorW, lintelHeight, t);
                lintel.translate(0, h - lintelHeight / 2, d / 2);
                walls.push(lintel);
            }
        } catch (e) {
            console.error("B\"H - ⚡ WallBuilder encountered a structural anomaly.", e);
        }

        return walls;
    }
}
