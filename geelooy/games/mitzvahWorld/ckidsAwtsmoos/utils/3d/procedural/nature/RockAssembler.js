
/**
 * B"H
 * @module RockAssembler
 * @description
 * "He who turns the rock into a pool of water, the flint into a fountain of waters." (Tehillim 114:8)
 * This module takes a perfect, symmetrical geometry (Dodecahedron) and applies 
 * jagged, random noise to its vertices, manifesting a unique rocky vessel.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class RockAssembler {
    /**
     * @function generate
     * @description Forges a single irregular rock.
     */
    static generate(radius = 1, detail = 1) {
        try {
            const geo = new THREE.DodecahedronGeometry(radius, detail);
            const pos = geo.attributes.position;
            
            for(let i = 0; i < pos.count; i++) {
                const noise = 1.0 + (Math.random() - 0.5) * 0.4;
                pos.setX(i, pos.getX(i) * noise);
                pos.setY(i, pos.getY(i) * noise);
                pos.setZ(i, pos.getZ(i) * noise);
            }
            
            geo.computeVertexNormals();
            return geo;
        } catch (e) {
            console.error("B\"H - ⚡ Rock formation failed.", e);
            return new THREE.BoxGeometry(1, 1, 1);
        }
    }
}
