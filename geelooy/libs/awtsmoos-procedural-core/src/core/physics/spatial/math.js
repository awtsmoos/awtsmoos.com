
// B"H
/**
 * @file math.js
 * @brief Sacred geometry intersection logic.
 */
import { Vec3 } from '../../math/vec3.js';

export const SpatialMath = {
    /**
     * Finds the closest point on a triangle (p0, p1, p2) to a point p.
     */
    closestPointOnTriangle: (p, p0, p1, p2) => {
        const ab = Vec3.sub(p1, p0);
        const ac = Vec3.sub(p2, p0);
        const ap = Vec3.sub(p, p0);
        const d1 = Vec3.dot(ab, ap);
        const d2 = Vec3.dot(ac, ap);
        if (d1 <= 0.0 && d2 <= 0.0) return p0;

        const bp = Vec3.sub(p, p1);
        const d3 = Vec3.dot(ab, bp);
        const d4 = Vec3.dot(ac, bp);
        if (d3 >= 0.0 && d4 <= d3) return p1;

        const vc = d1 * d4 - d3 * d2;
        if (vc <= 0.0 && d1 >= 0.0 && d3 <= 0.0) {
            const v = d1 / (d1 - d3);
            return Vec3.add(p0, Vec3.scale(ab, v));
        }

        const cp = Vec3.sub(p, p2);
        const d5 = Vec3.dot(ab, cp);
        const d6 = Vec3.dot(ac, cp);
        if (d6 >= 0.0 && d5 <= d6) return p2;

        const vb = d5 * d2 - d1 * d6;
        if (vb <= 0.0 && d2 >= 0.0 && d6 <= 0.0) {
            const w = d2 / (d2 - d6);
            return Vec3.add(p0, Vec3.scale(ac, w));
        }

        const va = d3 * d6 - d5 * d4;
        if (va <= 0.0 && (d4 - d3) >= 0.0 && (d5 - d6) >= 0.0) {
            const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
            return Vec3.add(p1, Vec3.scale(Vec3.sub(p2, p1), w));
        }

        const denom = 1.0 / (va + vb + vc);
        const v = vb * denom;
        const w = vc * denom;
        return Vec3.add(p0, Vec3.add(Vec3.scale(ab, v), Vec3.scale(ac, w)));
    },

    /**
     * Calculates the squared distance from a point to a line segment.
     */
    distSqPointToSegment: (p, s1, s2) => {
        const v = Vec3.sub(s2, s1);
        const w = Vec3.sub(p, s1);
        const c1 = Vec3.dot(w, v);
        if (c1 <= 0) return Vec3.distSq(p, s1);
        const c2 = Vec3.dot(v, v);
        if (c2 <= c1) return Vec3.distSq(p, s2);
        const b = c1 / c2;
        const pb = Vec3.add(s1, Vec3.scale(v, b));
        return Vec3.distSq(p, pb);
    },

    /**
     * Checks if a Ray intersects a Triangle.
     * Returns distance or null.
     */
    rayTriangleIntersect: (origin, dir, v0, v1, v2) => {
        const EPSILON = 0.000001;
        const edge1 = Vec3.sub(v1, v0);
        const edge2 = Vec3.sub(v2, v0);
        const h = Vec3.cross(dir, edge2);
        const a = Vec3.dot(edge1, h);

        if (a > -EPSILON && a < EPSILON) return null; // Parallel

        const f = 1.0 / a;
        const s = Vec3.sub(origin, v0);
        const u = f * Vec3.dot(s, h);

        if (u < 0.0 || u > 1.0) return null;

        const q = Vec3.cross(s, edge1);
        const v = f * Vec3.dot(dir, q);

        if (v < 0.0 || u + v > 1.0) return null;

        const t = f * Vec3.dot(edge2, q);
        if (t > EPSILON) return t;
        
        return null;
    }
};
