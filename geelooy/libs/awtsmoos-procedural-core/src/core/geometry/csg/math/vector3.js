// B"H
/**
 * @file vector3.js
 * @brief 3D Vector math for construction. Reflecting the three dimensions of divine manifestation.
 */

export class Vector3D {
    constructor(x = 0, y = 0, z = 0) {
        if (Array.isArray(x)) {
            this.x = x[0]; this.y = x[1]; this.z = x[2] || 0;
        } else {
            this.x = x; this.y = y; this.z = z;
        }
    }

    clone() { return new Vector3D(this.x, this.y, this.z); }
    negated() { return new Vector3D(-this.x, -this.y, -this.z); }
    plus(a) { return new Vector3D(this.x + a.x, this.y + a.y, this.z + a.z); }
    minus(a) { return new Vector3D(this.x - a.x, this.y - a.y, this.z - a.z); }
    times(a) { return new Vector3D(this.x * a, this.y * a, this.z * a); }
    dividedBy(a) { return new Vector3D(this.x / a, this.y / a, this.z / a); }
    dot(a) { return this.x * a.x + this.y * a.y + this.z * a.z; }
    lerp(a, t) { return this.plus(a.minus(this).times(t)); }
    lengthSquared() { return this.dot(this); }
    length() { return Math.sqrt(this.lengthSquared()); }
    unit() { return this.dividedBy(this.length()); }
    cross(a) {
        return new Vector3D(
            this.y * a.z - this.z * a.y,
            this.z * a.x - this.x * a.z,
            this.x * a.y - this.y * a.x
        );
    }
    distanceTo(a) { return this.minus(a).length(); }
    equals(a) { return this.x === a.x && this.y === a.y && this.z === a.z; }
}
