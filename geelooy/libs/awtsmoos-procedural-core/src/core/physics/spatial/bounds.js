
// B"H
/**
 * @file bounds.js
 * @brief Axis-Aligned Bounding Box (AABB) logic with Ray Intersection.
 */

export class AABB {
    constructor(min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity]) {
        this.min = [...min];
        this.max = [...max];
    }

    expandByPoint(p) {
        this.min[0] = Math.min(this.min[0], p[0]);
        this.min[1] = Math.min(this.min[1], p[1]);
        this.min[2] = Math.min(this.min[2], p[2]);

        this.max[0] = Math.max(this.max[0], p[0]);
        this.max[1] = Math.max(this.max[1], p[1]);
        this.max[2] = Math.max(this.max[2], p[2]);
    }

    intersectsSphere(center, radius) {
        let d = 0;
        for (let i = 0; i < 3; i++) {
            const e = Math.max(this.min[i] - center[i], 0) + Math.max(center[i] - this.max[i], 0);
            d += e * e;
        }
        return d <= radius * radius;
    }
    
    intersectsTriangle(v0, v1, v2) {
        const triMin = [
            Math.min(v0[0], v1[0], v2[0]),
            Math.min(v0[1], v1[1], v2[1]),
            Math.min(v0[2], v1[2], v2[2])
        ];
        const triMax = [
            Math.max(v0[0], v1[0], v2[0]),
            Math.max(v0[1], v1[1], v2[1]),
            Math.max(v0[2], v1[2], v2[2])
        ];

        return (
            triMin[0] <= this.max[0] && triMax[0] >= this.min[0] &&
            triMin[1] <= this.max[1] && triMax[1] >= this.min[1] &&
            triMin[2] <= this.max[2] && triMax[2] >= this.min[2]
        );
    }

    /**
     * B"H - THE FIX: Slab Method for Ray-AABB intersection.
     * @param {Array} origin [x,y,z]
     * @param {Array} dir [x,y,z] normalized direction
     */
    intersectsRay(origin, dir) {
        let tmin = -Infinity;
        let tmax = Infinity;

        for (let i = 0; i < 3; i++) {
            if (Math.abs(dir[i]) < 1e-7) {
                // Ray is parallel to this axis
                if (origin[i] < this.min[i] || origin[i] > this.max[i]) return false;
            } else {
                const invDir = 1.0 / dir[i];
                let t1 = (this.min[i] - origin[i]) * invDir;
                let t2 = (this.max[i] - origin[i]) * invDir;

                if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }

                tmin = Math.max(tmin, t1);
                tmax = Math.min(tmax, t2);

                if (tmin > tmax) return false;
            }
        }
        return tmax > 0;
    }
}
