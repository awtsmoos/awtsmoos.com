
/**
 * B"H
 * @module GeometryCarver
 * @description
 * 📐 CHAPTER 21: THE TOOLS OF BEZALEL 📐
 * 
 * Materializes a Three.js geometry from the JSON blueprint instantly and quietly.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import GeometryManager from '../../math/GeometryManager.js?compact=true&v=full-chain-cache-bust-20260708-bh10';

export default class GeometryCarver {
    static carve(typeName, rawArgs) {
        const args = Array.isArray(rawArgs) ? rawArgs : [rawArgs];
        
        let geometry;
        try {
            if (GeometryManager.has(typeName)) {
                geometry = GeometryManager.create(typeName, args);
            } 
            else if (THREE[typeName]) {
                geometry = new THREE[typeName](...args);
            } 
            else {
                console.warn(`B"H - ⚠️ FORM ERROR: Archetype [${typeName}] is non-existent. Supplying fallback 1x1x1.`);
                geometry = new THREE.BoxGeometry(1, 1, 1);
            }

            if (geometry) {
                geometry.computeBoundingBox();
                geometry.computeBoundingSphere();
            }

            return geometry;
        } catch (e) {
            console.error(`B"H - 🆘 THE AXE BROKE during [${typeName}]:`, e);
            return new THREE.BoxGeometry(1, 1, 1);
        }
    }
}
