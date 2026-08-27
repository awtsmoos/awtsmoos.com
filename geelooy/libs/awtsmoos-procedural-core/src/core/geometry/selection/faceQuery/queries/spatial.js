
// B"H
/**
 * @file spatial.js
 * @chapter THE ANALYTICAL GAZE
 */

import { getFaceCentroid } from '../utils.js';
import { ensureVessel } from '../setMath.js';
import { SpatialMath } from '../../../../physics/spatial/math.js';
import { Vec3 } from '../../../../math/vec3.js';

const filterSet = (allIndices, conditionFn) => {
    const source = ensureVessel(allIndices);
    return new Set(Array.from(source).filter(conditionFn));
};

export const SPATIAL_QUERIES = Object.freeze({
    'all': (m, p, i) => ensureVessel(i),

    'tag': (mesh, params, allIndices) => {
        // B"H - Deep search for the persistent mark
        return filterSet(allIndices, idx => {
            const tags = mesh.faces[idx].tags || [];
            return tags.includes(params);
        });
    },
    
    'box': (mesh, params, allIndices) => filterSet(allIndices, idx => {
        const c = getFaceCentroid(mesh.faces[idx]);
        const min = params.min, max = params.max;
        return c[0] >= min[0] && c[0] <= max[0] &&
               c[1] >= min[1] && c[1] <= max[1] &&
               c[2] >= min[2] && c[2] <= max[2];
    })
    // ... other spatial queries can be added here
});
