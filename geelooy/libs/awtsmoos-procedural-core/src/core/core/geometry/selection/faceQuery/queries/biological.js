
/* B"H
*/
/**
 * @file biological.js
 * @chapter THE BREATH OF THE GOLEM
 */

import { Vec3 } from '../../../../math/vec3.js';
import { getFaceCentroid, getFaceNormal } from '../utils.js';
import { ensureVessel } from '../setMath.js';

const filterSet = (allIndices, conditionFn) => {
    const source = ensureVessel(allIndices);
    return new Set(Array.from(source).filter(conditionFn));
};

export const BIOLOGICAL_QUERIES = Object.freeze({
    'subsurfaceBloodPool': (m, p, i) => filterSet(i, idx => Vec3.dot(getFaceNormal(m.faces[idx]), Vec3.normalize(getFaceCentroid(m.faces[idx]))) < (p.threshold || -0.6)),
    'zygomaticArch': (m, p, i) => filterSet(i, idx => { const c = getFaceCentroid(m.faces[idx]); return c[1] > 2.0 && c[1] < 3.5 && Math.abs(c[0]) > 1.0; }),
    'umbilicusInset': (m, p, i) => filterSet(i, idx => Vec3.distSq(getFaceCentroid(m.faces[idx]), p.center || [0, 0, 1.0]) < (p.radius || 0.2)),
    'tearDuctPinch': (m, p, i) => filterSet(i, idx => { const c = getFaceCentroid(m.faces[idx]); return Math.abs(c[0]) > 0.2 && Math.abs(c[0]) < 0.6 && c[1] > 2.5 && c[1] < 3.0; }),
    'jawlineSharpen': (m, p, i) => filterSet(i, idx => { const c = getFaceCentroid(m.faces[idx]); return c[1] > -0.5 && c[1] < 0.5 && c[2] > 0.0; }),
    'epicanthicFold': (m, p, i) => filterSet(i, idx => { const c = getFaceCentroid(m.faces[idx]); return c[1] > 3.0 && c[1] < 3.5 && Math.abs(c[0]) > 0.5 && Math.abs(c[0]) < 1.5; }),
    'tracheaBump': (m, p, i) => filterSet(i, idx => { const c = getFaceCentroid(m.faces[idx]); return Math.abs(c[0]) < 0.3 && c[1] > -1.0 && c[1] < 0.0 && c[2] > 0.8; }),
    'clavicleV': (m, p, i) => filterSet(i, idx => { const c = getFaceCentroid(m.faces[idx]); return c[1] > -1.5 && c[1] < -0.5 && c[2] > 0.5; }),
    'spinalFurrow': (m, p, i) => filterSet(i, idx => { const c = getFaceCentroid(m.faces[idx]); return Math.abs(c[0]) < 0.4 && c[2] < -0.8; }),
    'footArch': (m, p, i) => filterSet(i, idx => { const c = getFaceCentroid(m.faces[idx]); return c[1] < -4.8 && Math.abs(c[0]) < 0.8 && c[2] > -0.5 && c[2] < 0.5; }),
    'proceduralKnuckle': (m, p, i) => filterSet(i, idx => { const c = getFaceCentroid(m.faces[idx]); return c[1] > -1.0 && c[1] < 1.0 && Math.abs(c[0]) > 2.0 && c[2] > 0.0; }),
    'nailbedFlatten': (m, p, i) => filterSet(i, idx => { const c = getFaceCentroid(m.faces[idx]); return c[1] < -2.0 && Math.abs(c[0]) > 2.0 && c[2] > 0.5; }),
    'gumRidge': (m, p, i) => filterSet(i, idx => { const c = getFaceCentroid(m.faces[idx]); return c[1] > 1.5 && c[1] < 2.0 && c[2] > 0.5 && c[2] < 1.0; }),
    'uvulaExtrusion': (m, p, i) => filterSet(i, idx => { const c = getFaceCentroid(m.faces[idx]); return Math.abs(c[0]) < 0.2 && c[1] > 1.8 && c[1] < 2.2 && c[2] < 0.0; })
});
