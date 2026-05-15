
// B"H
/**
 * @file transformProjector.js
 * @brief Sacred math to map screen-space mouse movements to 3D axis constraints.
 * 
 * THE CALCULUS OF THE GUIDED WILL:
 * The mouse moves in two dimensions, flat upon the screen,
 * But the vessel lives in three, in the space between!
 * We draw a plane of light that faces the observer's eye,
 * And intersect the ray to see where the new point lies.
 * We project that point upon the pillar (X, Y, or Z),
 * So the object moves exactly where it was meant to be!
 */

import { Vec3 } from '../../math/vec3.js';

export class TransformProjector {
    /**
     * B"H - Finds the closest point on a 3D axis line to a given 3D ray.
     * @param {Object} ray - { origin: [x,y,z], direction: [x,y,z] }
     * @param {Array} axisOrigin - The starting point of the axis in 3D space.
     * @param {Array} axisDir - The normalized direction of the axis (e.g. [1,0,0]).
     * @returns {Array} The 3D point on the axis.
     */
    static projectRayToAxis(ray, axisOrigin, axisDir) {
        // We find the shortest distance between two lines in 3D space.
        // Line 1: ray.origin + t * ray.direction
        // Line 2: axisOrigin + s * axisDir
        
        const w0 = Vec3.sub(ray.origin, axisOrigin);
        const a = Vec3.dot(ray.direction, ray.direction);
        const b = Vec3.dot(ray.direction, axisDir);
        const c = Vec3.dot(axisDir, axisDir);
        const d = Vec3.dot(ray.direction, w0);
        const e = Vec3.dot(axisDir, w0);

        const denom = a * c - b * b;
        
        // If lines are parallel, just return the origin
        if (denom < 1e-6) return [...axisOrigin];

        // s is the parameter along the axis line
        const s = (a * e - b * d) / denom;
        
        return Vec3.add(axisOrigin, Vec3.scale(axisDir, s));
    }

    /**
     * B"H - Intersects a ray with a plane facing the camera.
     */
    static projectRayToPlane(ray, planeOrigin, planeNormal) {
        const denom = Vec3.dot(ray.direction, planeNormal);
        if (Math.abs(denom) < 1e-6) return null; // Parallel

        const p0l0 = Vec3.sub(planeOrigin, ray.origin);
        const t = Vec3.dot(p0l0, planeNormal) / denom;

        if (t < 0) return null; // Behind camera

        return Vec3.add(ray.origin, Vec3.scale(ray.direction, t));
    }
}
