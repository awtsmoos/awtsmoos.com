
/**
 * B"H
 * @module BladeBuilder
 * @description
 * Sculpts the primordial curve of a single blade of grass.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class BladeBuilder {
    static build(width = 0.1, height = 0.6) {
        try {
            // Use a plane with a few segments to allow curving
            const geo = new THREE.PlaneGeometry(width, height, 1, 4);
            geo.translate(0, height / 2, 0); // Origin at bottom root

            const pos = geo.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const y = pos.getY(i);
                const normalizedY = y / height;
                
                // Curve outward as it goes up
                const bend = Math.pow(normalizedY, 2) * 0.3;
                pos.setZ(i, bend);
                
                // Taper to a point
                if (normalizedY > 0.5) {
                    const taper = 1.0 - ((normalizedY - 0.5) * 2.0);
                    pos.setX(i, pos.getX(i) * taper);
                }
            }
            
            geo.computeVertexNormals();
            return geo;
        } catch (e) {
            console.error("B\"H - ⚡ BladeBuilder failed.", e);
            return new THREE.BoxGeometry(0.1, 0.5, 0.1);
        }
    }
}
