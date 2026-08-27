
// B"H
/**
 * @file vertex.js
 * @brief A singular point in space.
 */
import { Vector3D } from '../math/vector3.js';

export class Vertex {
    constructor(pos, col) {
        this.pos = pos; // Vector3D
        this.col = col || [1, 1, 1, 1];
    }

    clone() {
        return new Vertex(this.pos.clone(), [...this.col]);
    }

    flip() {
        // Position stays same, normal (implied) flips.
        // If we stored explicit normals, negate them here.
    }

    interpolate(other, t) {
        const v = new Vertex(this.pos.lerp(other.pos, t));
        if (this.col && other.col) {
            v.col = [
                this.col[0] + (other.col[0] - this.col[0]) * t,
                this.col[1] + (other.col[1] - this.col[1]) * t,
                this.col[2] + (other.col[2] - this.col[2]) * t,
                this.col[3] + (other.col[3] - this.col[3]) * t
            ];
        }
        return v;
    }
}
