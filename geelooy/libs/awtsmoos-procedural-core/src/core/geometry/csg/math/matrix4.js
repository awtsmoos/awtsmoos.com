// B"H
/**
 * @file matrix4.js
 * @brief 4x4 Matrix for spatial positioning of geometry.
 */
import { Vector3D } from './vector3.js';

export class Matrix4x4 {
    constructor(elements) {
        this.elements = elements || [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    }

    multiply(m) {
        const out = new Array(16);
        const a = this.elements, b = m.elements;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                out[i * 4 + j] = a[i * 4 + 0] * b[0 * 4 + j] +
                                 a[i * 4 + 1] * b[1 * 4 + j] +
                                 a[i * 4 + 2] * b[2 * 4 + j] +
                                 a[i * 4 + 3] * b[3 * 4 + j];
            }
        }
        return new Matrix4x4(out);
    }

    leftMultiply1x3Vector(v) {
        const e = this.elements;
        const x = v.x * e[0] + v.y * e[4] + v.z * e[8] + e[12];
        const y = v.x * e[1] + v.y * e[5] + v.z * e[9] + e[13];
        const z = v.x * e[2] + v.y * e[6] + v.z * e[10] + e[14];
        const w = v.x * e[3] + v.y * e[7] + v.z * e[11] + e[15];
        return new Vector3D(x / w, y / w, z / w);
    }
    
    static translation(v) {
        return new Matrix4x4([1,0,0,0, 0,1,0,0, 0,0,1,0, v.x, v.y, v.z, 1]);
    }

    isMirroring() {
        const u = new Vector3D(this.elements[0], this.elements[4], this.elements[8]);
        const v = new Vector3D(this.elements[1], this.elements[5], this.elements[9]);
        const w = new Vector3D(this.elements[2], this.elements[6], this.elements[10]);
        return u.cross(v).dot(w) < 0;
    }
}
