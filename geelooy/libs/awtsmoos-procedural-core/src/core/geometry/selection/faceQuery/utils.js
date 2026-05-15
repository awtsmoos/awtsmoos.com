
// B"H
/**
 * @file utils.js
 * @chapter THE MEASURE OF THE VESSEL
 */

import { Vec3 } from '../../../math/vec3.js';
import { route } from '../../../utils/router.js';

export const getFaceCentroid = (face) => route(face && face.vertices && face.vertices.length > 0, {
    'true': () => {
        const sum = face.vertices.reduce((acc, v) => Vec3.add(acc, v.pos), [0, 0, 0]);
        return Vec3.scale(sum, 1.0 / face.vertices.length);
    },
    'false': () => [0, 0, 0]
});

export const getFaceNormal = (face) => route(face && face.vertices && face.vertices.length >= 3, {
    'true': () => {
        const v = face.vertices;
        return Vec3.normalize(Vec3.cross(Vec3.sub(v[1].pos, v[0].pos), Vec3.sub(v[v.length - 1].pos, v[0].pos)));
    },
    'false': () => [0, 1, 0]
});
