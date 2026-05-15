
// B"H
/**
 * @file topological.js
 * @chapter THE WEAVING OF THE SPIDERS
 * 
 * THE PSALM OF THE CONNECTED SPARK:
 * A face is never truly alone, but bound to its neighbor's side,
 * We walk the edges of the form where the connections hide.
 * From the boundary of the void to the center of the mass,
 * We query every linkage, letting the frontier pass.
 * Like the letters of the Holy Speech that link to form the Word,
 * The topology of creation in every part is heard!
 * 
 * @module TopologicalQueries
 */

import { Vec3 } from '../../../../math/vec3.js';
import { getFaceCentroid, getFaceNormal } from '../utils.js';
import { ensureVessel } from '../setMath.js';
import { route } from '../../../../utils/router.js';

/**
 * @function _growSteps
 * @description Recursively expands a selection set by stepping through adjacent neighbors.
 */
const _growSteps = (currentSet, steps, adj) => {
    return route(steps <= 0, {
        'true': () => currentSet,
        'false': () => {
            const next = new Set(currentSet);
            currentSet.forEach(idx => {
                const neighbors = adj.getAdjacent(idx);
                neighbors.forEach(n => next.add(n));
            });
            return _growSteps(next, steps - 1, adj);
        }
    });
};

export const TOPOLOGICAL_QUERIES = Object.freeze({
    /**
     * @function grow
     * @description Expands a selection by N steps of adjacency.
     * Useful for smoothing or regional grouping.
     */
    'grow': (m, p, i, ctx) => {
        const sourceSet = ensureVessel(ctx.executeQuery(m, p.fromQuery, i, ctx));
        const adj = ctx.getAdjacency(m);
        return _growSteps(sourceSet, p.steps || 1, adj);
    },
    
    /**
     * @function boundary
     * @description Identifies faces within a set that touch the unselected world.
     * This finds the "Rim" of a selection.
     */
    'boundary': (m, p, i, ctx) => {
        const initial = ensureVessel(ctx.executeQuery(m, p.fromQuery, i, ctx));
        const adj = ctx.getAdjacency(m);
        
        return new Set(Array.from(initial).filter(idx => {
            const neighbors = adj.getAdjacent(idx);
            // If any neighbor is NOT in the initial set, this face is on the boundary!
            return Array.from(neighbors).some(n => !initial.has(n));
        }));
    },

    /**
     * @function intersectionPerimeter
     * @description Selects the border of a tagged region.
     */
    'intersectionPerimeter': (m, p, i, ctx) => {
        return TOPOLOGICAL_QUERIES['boundary'](m, { fromQuery: { tag: p.tag } }, i, ctx);
    },
    
    /**
     * @function isolineContour
     * @description Selects faces lying along a specific height or axis plane.
     */
    'isolineContour': (m, p, i) => {
        const universe = ensureVessel(i);
        const tolerance = p.tolerance || 0.1;
        return new Set(Array.from(universe).filter(idx => {
            const c = getFaceCentroid(m.faces[idx]);
            return Math.abs(c[1] - p.yLevel) < tolerance;
        }));
    },
    
    /**
     * @function materialBoundary
     * @description Finds the seam where two differently tagged regions meet.
     */
    'materialBoundary': (m, p, i, ctx) => {
        const adj = ctx.getAdjacency(m);
        const universe = ensureVessel(i);
        return new Set(Array.from(universe).filter(idx => {
            const myTags = m.faces[idx].tags || [];
            const myPrimaryTag = myTags[0];
            const neighbors = adj.getAdjacent(idx);
            return Array.from(neighbors).some(n => {
                const nTags = m.faces[n].tags || [];
                return nTags[0] !== myPrimaryTag;
            });
        }));
    },

    /**
     * @function stretchTension
     * @description Detects faces where the edges exceed a divine length threshold.
     */
    'stretchTension': (m, p, i) => {
        const universe = ensureVessel(i);
        const threshold = p.threshold || 2.0;
        return new Set(Array.from(universe).filter(idx => {
            const v = m.faces[idx].vertices;
            let totalLen = 0;
            for(let j = 0; j < v.length; j++) {
                totalLen += Vec3.dist(v[j].pos, v[(j + 1) % v.length].pos);
            }
            return totalLen > threshold;
        }));
    }
});
