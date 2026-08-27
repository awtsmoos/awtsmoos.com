
// B"H
/**
 * @file spatialQueries.js
 * @chapter THE DIMENSIONS OF ABSOLUTE TRUTH
 * 
 * THE PSALM OF THE UNBROKEN PATH:
 * To ask "if" is to doubt the Creator's plan,
 * A branching path built by the mind of man.
 * But here in the realm of the pure and the true,
 * The data flows straight, as the morning dew!
 * We filter, we map, we reduce the array,
 * Erasing the "else", casting "switch" away!
 * 
 * @module SpatialQueries
 */

import { Vec3 } from '../../../math/vec3.js';
import { getFaceCentroid } from './utils.js';

const getExportedPoint = (ctx, name) => (ctx.objectData?.exportedPoints || {})[name] || [Infinity, Infinity, Infinity];

export const SPATIAL_QUERIES = Object.freeze({
    'tag': (mesh, params, allIndices) => new Set(
        Array.from(allIndices).filter(idx => (mesh.faces[idx].tags || []).includes(params))
    ),

    'box': (mesh, params, allIndices) => new Set(
        Array.from(allIndices).filter(idx => {
            const c = getFaceCentroid(mesh.faces[idx]);
            return c[0] >= params.min[0] && c[0] <= params.max[0] &&
                   c[1] >= params.min[1] && c[1] <= params.max[1] &&
                   c[2] >= params.min[2] && c[2] <= params.max[2];
        })
    ),

    'semanticSphere': (mesh, params, allIndices, ctx) => new Set(
        Array.from(allIndices).filter(idx => 
            Vec3.distSq(getFaceCentroid(mesh.faces[idx]), getExportedPoint(ctx, params.pointName)) <= (params.radius * params.radius)
        )
    ),

    'closest': (mesh, params, allIndices, ctx) => {
        const baseSet = params.fromQuery ? ctx.executeQuery(mesh, params.fromQuery, allIndices, ctx) : allIndices;
        const arr = Array.from(baseSet).map(idx => ({ idx, dist: Vec3.distSq(getFaceCentroid(mesh.faces[idx]), params.to || [0,0,0]) }));
        arr.sort((a, b) => a.dist - b.dist);
        return new Set(arr.slice(0, params.count || 1).map(x => x.idx));
    },

    'checker': (mesh, params, allIndices, ctx) => {
        const baseSet = params.fromQuery ? ctx.executeQuery(mesh, params.fromQuery, allIndices, ctx) : allIndices;
        const nth = params.nth || 2;
        const offset = params.offset || 0;
        return new Set(Array.from(baseSet).filter((idx, i) => (i + offset) % nth === 0));
    }
});
