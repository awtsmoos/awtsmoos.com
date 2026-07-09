
/**
 * B"H
 * @module DisplaceModifier
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class DisplaceModifier {
    static apply(geometry, mod) {
        const clone = geometry.clone();
        if(!clone.attributes.normal) clone.computeVertexNormals();

        const pos = clone.attributes.position;
        const norm = clone.attributes.normal;
        
        const strength = mod.strength || 0.5;
        const scale = mod.scale || 1.0;

        for (let i = 0; i < pos.count; i++) {
            // Simple chaotic displacement using sine waves (pseudo-noise)
            const px = pos.getX(i) * scale;
            const py = pos.getY(i) * scale;
            const pz = pos.getZ(i) * scale;

            const noise = Math.sin(px * 12.9898 + pz * 78.233) * Math.cos(py * 4.1414);
            
            pos.setX(i, pos.getX(i) + norm.getX(i) * noise * strength);
            pos.setY(i, pos.getY(i) + norm.getY(i) * noise * strength);
            pos.setZ(i, pos.getZ(i) + norm.getZ(i) * noise * strength);
        }
        return clone;
    }
}
