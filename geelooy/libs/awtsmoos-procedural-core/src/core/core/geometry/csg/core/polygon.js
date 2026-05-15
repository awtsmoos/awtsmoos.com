
// B"H
/**
 * @file polygon.js
 * @brief A convex boundary of creation.
 */
import { Plane } from './plane.js';

export class Polygon {
    constructor(vertices, shared, plane) {
        this.vertices = vertices;
        this.shared = shared || null;
        this.plane = plane || Plane.fromVector3Ds(vertices[0].pos, vertices[1].pos, vertices[2].pos);
    }

    clone() {
        return new Polygon(
            this.vertices.map(v => v.clone()), 
            this.shared ? [...this.shared] : null,
            this.plane.clone()
        );
    }

    flip() {
        this.vertices.reverse().map(v => v.flip());
        this.plane.flip();
    }
}
