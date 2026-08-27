
// B"H
/**
 * @file querySorter.js
 * @chapter THE WEIGHING OF THE SOULS
 */

import { Vec3 } from '../../../math/vec3.js';
import { getFaceCentroid } from './utils.js';

const SORT_DISPATCH = {
    'true': (arr) => arr.sort((a, b) => a.dist - b.dist),
    'false': (arr) => arr
};

export function sortAndLimitFaces(mesh, resultSet, queryOpts) {
    const VOID_ROUTER = {
        'true': () => [],
        'false': () => {
            const isSimple = queryOpts.closestTo === undefined && queryOpts.count === undefined;
            const SIMPLE_ROUTER = {
                'true': () => Array.from(resultSet),
                'false': () => {
                    const count = queryOpts.count !== undefined ? queryOpts.count : resultSet.size;
                    const targetPoint = queryOpts.closestTo || [0, 0, 0];
                    
                    const arr = Array.from(resultSet).map(idx => ({
                        idx, 
                        dist: Vec3.distSq(getFaceCentroid(mesh.faces[idx]), targetPoint)
                    }));
                    
                    SORT_DISPATCH[String(queryOpts.closestTo !== undefined)](arr);
                    return arr.slice(0, count).map(x => x.idx);
                }
            };
            return SIMPLE_ROUTER[String(isSimple)]();
        }
    };
    
    return VOID_ROUTER[String(!resultSet || resultSet.size === 0)]();
}
