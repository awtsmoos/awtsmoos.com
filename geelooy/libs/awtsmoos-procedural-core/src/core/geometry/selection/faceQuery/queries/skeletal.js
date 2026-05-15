
/* B"H
*/
/**
 * @file skeletal.js
 * @chapter THE WEIGHT OF THE BONES
 */

import { Vec3 } from '../../../../math/vec3.js';
import { getFaceCentroid } from '../utils.js';
import { ensureVessel } from '../setMath.js';

const filterSet = (allIndices, conditionFn) => {
    const source = ensureVessel(allIndices);
    return new Set(Array.from(source).filter(conditionFn));
};

export const SKELETAL_QUERIES = Object.freeze({
    'boneWeightGradient': (m, p, i) => filterSet(i, idx => {
        let maxW = 0;
        m.faces[idx].vertices.forEach(v => {
            if (v.boneIndices && v.boneWeights) {
                for(let k=0; k<4; k++) {
                    if (v.boneIndices[k] === p.boneIndex) maxW = Math.max(maxW, v.boneWeights[k]);
                }
            }
        });
        return maxW >= p.minWeight && maxW <= p.maxWeight;
    }),

    'proximityToBone': (m, p, i, ctx) => filterSet(i, idx => {
        const bonePos = ctx.objectData?.bonePositions?.[p.boneId] || [0,0,0];
        return Vec3.distSq(getFaceCentroid(m.faces[idx]), bonePos) < p.radius * p.radius;
    })
});
