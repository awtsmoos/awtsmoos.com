
// B"H
/**
 * @file globalTransforms.js
 * @chapter THE MACROCOSMIC SHIFT
 * 
 * THE HYMN OF THE UNIVERSE MOVED:
 * To move a single point is an act of local will,
 * But to move the entire mesh requires a grander skill!
 * We map every vertex, tracking what was seen,
 * To shift the entire creation across the digital screen.
 */

import { Vec3 } from '../../../math/vec3.js';
import { executeCondition } from '../../../logic/pureConditionals.js';

export const scaleMeshModifier = (mesh, scale) => {
    return executeCondition(scale && scale.length === 3, () => {
        const sx = scale[0], sy = scale[1], sz = scale[2];
        const visited = new Set();
        mesh.faces.forEach(face => face.vertices.forEach(v => {
            executeCondition(!visited.has(v), () => {
                v.pos[0] *= sx; v.pos[1] *= sy; v.pos[2] *= sz;
                visited.add(v);
            });
        }));
        return mesh;
    }, () => mesh);
};

export const rotateMeshModifier = (mesh, axis, angle) => {
    const AXIS_DISPATCH = {
        'x': [1,0,0], 'y': [0,1,0], 'z': [0,0,1],
        'default': [0,1,0]
    };
    const axisVec = AXIS_DISPATCH[axis] || AXIS_DISPATCH['default'];
    const visited = new Set();

    mesh.faces.forEach(face => face.vertices.forEach(v => {
        executeCondition(!visited.has(v), () => {
            v.pos = Vec3.rotate(v.pos, axisVec, angle);
            executeCondition(!!v.norm, () => { v.norm = Vec3.rotate(v.norm, axisVec, angle); });
            visited.add(v);
        });
    }));
    return mesh;
};

export const translateMeshModifier = (mesh, translation) => {
    return executeCondition(translation && translation.length === 3, () => {
        const visited = new Set();
        mesh.faces.forEach(face => face.vertices.forEach(v => {
            executeCondition(!visited.has(v), () => {
                v.pos = Vec3.add(v.pos, translation);
                visited.add(v);
            });
        }));
        return mesh;
    }, () => mesh);
};
