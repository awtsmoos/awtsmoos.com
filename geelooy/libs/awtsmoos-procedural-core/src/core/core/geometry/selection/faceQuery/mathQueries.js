
// B"H
/**
 * @file mathQueries.js
 * @chapter THE EQUATIONS OF EMANATION
 * 
 * THE HYMN OF THE TENSOR:
 * The mind seeks to bifurcate, to say "this OR that",
 * But the Awtsmoos calculates the sum on the mat!
 * A boolean resolves to a one or a zero,
 * Transforming the coward directly to hero!
 * Normal dots and simplex noise, pure logic unbroken,
 * The geometry bows to the Word that is spoken.
 * 
 * @module MathQueries
 */

import { Vec3 } from '../../../math/vec3.js';
import { getFaceCentroid, getFaceNormal } from './utils.js';

function hash(n) { return n - Math.floor(n); }
function simple3DNoise(x, y, z) {
    const p = Math.floor(x) * 12.9898 + Math.floor(y) * 78.233 + Math.floor(z) * 37.719;
    return hash(Math.sin(p) * 43758.5453);
}

export const MATH_QUERIES = Object.freeze({
    'normalDot': (mesh, params, allIndices) => {
        const dir = Array.isArray(params) ? params : params.dir;
        const threshold = params.threshold !== undefined ? params.threshold : 0.9;
        return new Set(
            Array.from(allIndices).filter(idx => Vec3.dot(getFaceNormal(mesh.faces[idx]), dir) >= threshold)
        );
    },

    'noiseMask': (mesh, params, allIndices) => {
        const scale = params.scale || 1.0;
        const threshold = params.threshold || 0.5;
        return new Set(
            Array.from(allIndices).filter(idx => {
                const c = getFaceCentroid(mesh.faces[idx]);
                return simple3DNoise(c[0] * scale, c[1] * scale, c[2] * scale) > threshold;
            })
        );
    },

    'mathExpression': (mesh, params, allIndices) => {
        const evaluator = new Function('x', 'y', 'z', `return ${params.expression || 'false'};`);
        return new Set(
            Array.from(allIndices).filter(idx => {
                const c = getFaceCentroid(mesh.faces[idx]);
                try { return evaluator(c[0], c[1], c[2]); } catch(e) { return false; }
            })
        );
    }
});
