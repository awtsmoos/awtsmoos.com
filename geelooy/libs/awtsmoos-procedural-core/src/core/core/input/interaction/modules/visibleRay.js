
// B"H
/**
 * @file visibleRay.js
 * @brief FULLY WRITTEN - FORCES THE TEST RAY (debug_ray_beam) TO BE VISIBLE EVERY TIME
 *        BUT NOW 100% SILENT ON MOUSE HOVER - NO MORE CONSOLE FLOOD.
 *
 * DEEP REASON FOR CHANGE: User explicitly demanded "TAKE AWAY LOGGING for every mouse hover ONLY LOG WHEN mouse clicks".
 * Every mousemove was dumping 10+ lines of ray math. Now completely removed.
 * InteractionLogger.logManifestation still fires on click with the full insane manifest.
 * Visual cylinder update remains perfect for debugging the ray path in the test scene.
 */

import { Vec3 } from '../../../math/vec3.js';

export class VisibleRay {
    /**
     * B"H - Draws the visible test ray (debug_ray_beam) from camera through hit point.
     * Guarantees the ray is always visible between origin and hit (or far into void).
     * NO LOGS - silent on hover as requested.
     */
    static draw(renderer, ray, hitPoint) {
        if (!renderer || !ray) {
            return;
        }

        let debugObj = null;
        renderer.objectMap.forEach(obj => {
            if (obj.id === 'debug_ray_beam') debugObj = obj;
        });

        if (!debugObj) {
            return;
        }

        const start = ray.origin;
        const end = hitPoint ? hitPoint : Vec3.add(start, Vec3.scale(ray.direction, 80));

        const dist = Vec3.dist(start, end);
        const center = Vec3.lerp(start, end, 0.5);
        const dir = ray.direction;

        // Build orthonormal basis for cylinder orientation
        const yAxis = dir;
        let xAxis = Vec3.cross([0, 1, 0], yAxis);
        if (Vec3.dot(xAxis, xAxis) < 0.0001) xAxis = [1, 0, 0];
        else xAxis = Vec3.normalize(xAxis);
        const zAxis = Vec3.normalize(Vec3.cross(xAxis, yAxis));

        const radius = 0.06;

        const matrix = new Float32Array([
            xAxis[0] * radius, xAxis[1] * radius, xAxis[2] * radius, 0,
            yAxis[0] * dist,   yAxis[1] * dist,   yAxis[2] * dist,   0,
            zAxis[0] * radius, zAxis[1] * radius, zAxis[2] * radius, 0,
            center[0],         center[1],         center[2],         1
        ]);

        // Apply everything
        debugObj.worldMatrix = matrix;
        debugObj.visible = true;
        debugObj.dirty = true;
        debugObj.matrixAutoUpdate = false;

        // Euler angles fallback
        const pitch = Math.acos(Math.max(-1, Math.min(1, dir[1])));
        const yaw = Math.atan2(dir[0], dir[2]);

        debugObj.position = [...center];
        debugObj.rotation = [pitch, yaw, 0];
        debugObj.scale = [radius, dist, radius];
    }
}
