
/**
 * B"H
 * @module TwistModifier
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class TwistModifier {
    static apply(geometry, mod) {
        const clone = geometry.clone();
        const pos = clone.attributes.position;
        
        const anglePerUnit = mod.angle || 0.1; // Radians per Y unit
        const axis = mod.axis || 'y';

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);

            let distance = y;
            if(axis === 'x') distance = x;
            if(axis === 'z') distance = z;

            const theta = distance * anglePerUnit;
            const cos = Math.cos(theta);
            const sin = Math.sin(theta);

            if (axis === 'y') {
                pos.setX(i, x * cos - z * sin);
                pos.setZ(i, x * sin + z * cos);
            } else if (axis === 'x') {
                pos.setY(i, y * cos - z * sin);
                pos.setZ(i, y * sin + z * cos);
            } else if (axis === 'z') {
                pos.setX(i, x * cos - y * sin);
                pos.setY(i, x * sin + y * cos);
            }
        }
        return clone;
    }
}
