
// B"H
/**
 * @file triangle.js
 * @brief The fundamental unit of spatial matter.
 */
import { Vec3 } from '../../math/vec3.js';

export class PhysicsTriangle {
    /**
     * @param {Array} a [x,y,z]
     * @param {Array} b [x,y,z]
     * @param {Array} c [x,y,z]
     * @param {object} sourceMesh - Reference to the visual vessel.
     */
    constructor(a, b, c, sourceMesh = null) {
        this.a = [...a];
        this.b = [...b];
        this.c = [...c];
        this.sourceMesh = sourceMesh;
        
        // B"H - Pre-calculate the Normal
        const e1 = Vec3.sub(b, a);
        const e2 = Vec3.sub(c, a);
        this.normal = Vec3.normalize(Vec3.cross(e1, e2));
    }

    getBounds() {
        return {
            min: [
                Math.min(this.a[0], this.b[0], this.c[0]),
                Math.min(this.a[1], this.b[1], this.c[1]),
                Math.min(this.a[2], this.b[2], this.c[2])
            ],
            max: [
                Math.max(this.a[0], this.b[0], this.c[0]),
                Math.max(this.a[1], this.b[1], this.c[1]),
                Math.max(this.a[2], this.b[2], this.c[2])
            ]
        };
    }
}
