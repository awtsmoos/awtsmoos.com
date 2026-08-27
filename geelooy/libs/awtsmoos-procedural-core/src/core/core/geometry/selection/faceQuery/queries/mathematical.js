
// B"H
/**
 * @file mathematical.js
 * @chapter THE LOGIC OF THE HEAVENS
 */

import { Vec3 } from '../../../../math/vec3.js';
import { getFaceCentroid, getFaceNormal } from '../utils.js';
import { ensureVessel } from '../setMath.js';
import { route } from '../../../../utils/router.js';

const filterSet = (allIndices, conditionFn) => {
    const source = ensureVessel(allIndices);
    return new Set(Array.from(source).filter(conditionFn));
};

export const MATHEMATICAL_QUERIES = Object.freeze({
    /**
     * @function normalDot
     * @description Selects faces whose normal vector aligns with a target direction.
     */
    'normalDot': (m, p, i) => {
        const isArr = Array.isArray(p);
        const dir = route(isArr, {
            'true': () => p,
            'false': () => (p && p.dir ? p.dir : [0, 1, 0])
        });
        const threshold = route(isArr, {
            'true': () => 0.9,
            'false': () => (p && p.threshold !== undefined ? p.threshold : 0.9)
        });
        const safeDir = (dir && dir.length >= 3) ? dir : [0, 1, 0];

        return filterSet(i, idx => {
            const face = m.faces[idx];
            if (!face) return false;
            return Vec3.dot(getFaceNormal(face), safeDir) >= threshold;
        });
    },

    'gravitationalSlingshot': (m, p, i) => filterSet(i, idx => {
        const distSq = Vec3.distSq(getFaceCentroid(m.faces[idx]), p.center || [0,0,0]);
        const minDistSq = (p.minDist || 0) * (p.minDist || 0);
        const maxDistSq = (p.maxDist || 1) * (p.maxDist || 1);
        return distSq >= minDistSq && distSq <= maxDistSq;
    }),

    'patternChecker': (m, p, i) => {
        const universe = Array.from(ensureVessel(i));
        const nth = p.nth || 2, offset = p.offset || 0;
        return new Set(universe.filter((idx, count) => (count + offset) % nth === 0));
    }
});
