
// B"H
/**
 * @file plane.js
 * @brief A divine boundary.
 */
const EPSILON = 1e-5;

export class Plane {
    constructor(normal, w) {
        this.normal = normal;
        this.w = w;
    }

    static fromVector3Ds(a, b, c) {
        const n = b.minus(a).cross(c.minus(a)).unit();
        return new Plane(n, n.dot(a));
    }

    clone() { return new Plane(this.normal.clone(), this.w); }

    flip() {
        this.normal = this.normal.negated();
        this.w = -this.w;
    }

    /**
     * Splits a polygon by this plane.
     * @param {Polygon} polygon 
     * @param {Array} coplanarFront 
     * @param {Array} coplanarBack 
     * @param {Array} front 
     * @param {Array} back 
     */
    splitPolygon(polygon, coplanarFront, coplanarBack, front, back) {
        const COPLANAR = 0;
        const FRONT = 1;
        const BACK = 2;
        const SPANNING = 3;

        let polygonType = 0;
        const types = [];

        for (let i = 0; i < polygon.vertices.length; i++) {
            const t = this.normal.dot(polygon.vertices[i].pos) - this.w;
            const type = (t < -EPSILON) ? BACK : (t > EPSILON) ? FRONT : COPLANAR;
            polygonType |= type;
            types.push(type);
        }

        switch (polygonType) {
            case COPLANAR:
                (this.normal.dot(polygon.plane.normal) > 0 ? coplanarFront : coplanarBack).push(polygon);
                break;
            case FRONT:
                front.push(polygon);
                break;
            case BACK:
                back.push(polygon);
                break;
            case SPANNING:
                const f = [], b = [];
                for (let i = 0; i < polygon.vertices.length; i++) {
                    const j = (i + 1) % polygon.vertices.length;
                    const ti = types[i], tj = types[j];
                    const vi = polygon.vertices[i], vj = polygon.vertices[j];
                    
                    if (ti !== BACK) f.push(vi);
                    if (ti !== FRONT) b.push(ti !== BACK ? vi.clone() : vi);
                    
                    if ((ti | tj) === SPANNING) {
                        const t = (this.w - this.normal.dot(vi.pos)) / this.normal.dot(vj.pos.minus(vi.pos));
                        const v = vi.interpolate(vj, t);
                        f.push(v);
                        b.push(v.clone());
                    }
                }
                if (f.length >= 3) front.push(new polygon.constructor(f, polygon.shared));
                if (b.length >= 3) back.push(new polygon.constructor(b, polygon.shared));
                break;
        }
    }
}
