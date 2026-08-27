
// B"H
/**
 * @file spaceBending.js
 * @brief Sacred module that warps rays from World Dimension into Local Dimension.
 * 
 * THE TRACTATE OF DIMENSIONS:
 * Everything is created from the Awtsmoos into the Unified 'World'.
 * But to properly test a box whose very soul is rotated and shifted, 
 * We must pull the Ray backward in time and space!
 * Instead of rotating the Box into the World, we invert the matrix,
 * And rotate the infinite Light Ray down into the Box's tiny personal reality!
 */

import { mat4_core } from '../../math/mat4/core.js';
import { Vec3 } from '../../math/vec3.js';

export class SpaceBender {
    /**
     * B"H - Sucks a ray into the localized dimension of an object.
     * 
     * @param {Object} worldRay - The divine Ray { origin, direction } in grand World scope.
     * @param {Float32Array} worldMat - The absolute Object Transform matrix cached previously.
     * @returns {Object|null} The transformed { origin, dir } ray, or null if the Void strikes (Inverse fail).
     */
    static worldToLocalRay(worldRay, worldMat) {
        const invWorld = mat4_core.identity();
        
        // If the object's reality scaled itself down to zero, the inverse explodes into null.
        if (!mat4_core.inverse(invWorld, worldMat)) return null;

        // Points translate and rotate. We pass them fully into Local Space!
        const localOrigin = mat4_core.transformPoint([], worldRay.origin, invWorld);
        
        // For Direction vectors, we simply define a Target point floating down the beam...
        const worldTarget = Vec3.add(worldRay.origin, worldRay.direction);
        const localTarget = mat4_core.transformPoint([], worldTarget, invWorld);
        
        // ...Then re-normalize the directional line within Local reality!
        const localDir = Vec3.normalize(Vec3.sub(localTarget, localOrigin));

        return { origin: localOrigin, dir: localDir };
    }

    /**
     * B"H - Emanates a deeply hidden point back outwards into the Unified World!
     * @param {Array<number>} localPoint - [x,y,z] from Local Space.
     * @param {Float32Array} worldMat - Forward Translation matrix!
     * @returns {Array<number>} [x,y,z] in World Space.
     */
    static localToWorldPoint(localPoint, worldMat) {
        return mat4_core.transformPoint([], localPoint, worldMat);
    }
}
