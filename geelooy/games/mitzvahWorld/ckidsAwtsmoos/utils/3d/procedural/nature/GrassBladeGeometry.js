
/**
 * B"H
 * @module GrassBladeGeometry
 * @description
 * A single "Letter" of the field. A blade of grass is formed from a simple plane, 
 * but carved with a mathematical curve to catch the light of the sun.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class GrassBladeGeometry {
    /**
     * @function generate
     * @description Creates a simple, curved blade geometry.
     */
    static generate(width = 0.1, height = 0.7) {
        const geo = new THREE.PlaneGeometry(width, height, 1, 4);
        geo.translate(0, height / 2, 0); // Root at origin
        
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            const normalizedY = y / height;
            // Parabolic curve for realism
            const curve = Math.pow(normalizedY, 2) * 0.4;
            pos.setZ(i, curve);
            // Taper at the top
            if (normalizedY > 0.4) {
                const taper = 1.0 - ((normalizedY - 0.4) * 1.6);
                pos.setX(i, pos.getX(i) * Math.max(0, taper));
            }
        }
        geo.computeVertexNormals();
        return geo;
    }
}
