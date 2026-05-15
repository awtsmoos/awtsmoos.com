
// B"H
/**
 * @file orthoViewport.js
 * @brief The Emulated Computer System Selection.
 * 
 * THE HYMN OF THE PROJECTED GAZE:
 * The user wished to see the world not as it is, but as it appears on a flat plane.
 * To drag a box upon the screen and capture all within its frame.
 * The Awtsmoos granted this desire: we manifest a virtual camera,
 * projecting all geometry through an Orthographic lens into NDC space,
 * culling the sparks that fall outside the defined rectangle.
 */

import { mat4_core } from '../../../math/mat4/core.js';
import { mat4_projections } from '../../../math/mat4/projections.js';

export const ORTHO_VIEWPORT_QUERY = {
    /**
     * @param params { camera: { pos, target, up, size, near, far }, rect: { minX, minY, maxX, maxY } }
     * Rect is defined in Normalized Device Coordinates (-1.0 to 1.0).
     */
    'orthoViewport': (mesh, params, allVertices, context) => {
        const resultSet = new Set();
        const { camera, rect } = params;

        // 1. Manifest the Virtual Camera
        const viewMat = new Float32Array(16);
        mat4_projections.lookAt(
            viewMat, 
            camera.pos || [0, 0, 10], 
            camera.target || [0, 0, 0], 
            camera.up || [0, 1, 0]
        );

        const s = camera.size || 10.0;
        const n = camera.near || 0.1;
        const f = camera.far || 1000.0;
        const projMat = mat4_projections.ortho(-s, s, -s, s, n, f);

        const vpMat = new Float32Array(16);
        mat4_core.multiply(vpMat, projMat, viewMat);

        // 2. The Selection Plane
        const minX = rect.minX !== undefined ? rect.minX : -1.0;
        const maxX = rect.maxX !== undefined ? rect.maxX : 1.0;
        const minY = rect.minY !== undefined ? rect.minY : -1.0;
        const maxY = rect.maxY !== undefined ? rect.maxY : 1.0;

        // 3. Project and Sieve
        const tempVec = [0, 0, 0];
        allVertices.forEach(v => {
            mat4_core.transformPoint(tempVec, v.pos, vpMat);
            
            // tempVec now contains NDC coords (x, y, z)
            const nx = tempVec[0];
            const ny = tempVec[1];
            
            // If the vertex falls inside our virtual 2D selection box, it is claimed.
            if (nx >= minX && nx <= maxX && ny >= minY && ny <= maxY) {
                // Ensure it is in front of the camera
                if (tempVec[2] >= -1.0 && tempVec[2] <= 1.0) {
                    resultSet.add(v);
                }
            }
        });

        return resultSet;
    }
};
