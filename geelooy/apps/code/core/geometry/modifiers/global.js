
// B"H
/**
 * @file global.js
 * @brief Global Transformations: Moving the Heavens and the Earth.
 * 
 * POEM OF THE SHIFT:
 * Where the center is found, the world shall expand,
 * At the word of the Maker, the stretch of the hand.
 * From the root to the crown, the measure is true,
 * Creating the old and manifesting the new.
 */
import { Vec3 } from '../../math/vec3.js';

/**
 * Scales the entire mesh relative to its internal origin.
 */
export function scaleMeshModifier(mesh, scale) {
    if (!mesh || !mesh.faces || !scale || scale.length !== 3) return mesh;
    const sx = scale[0], sy = scale[1], sz = scale[2];
    
    const visited = new Set();
    mesh.faces.forEach(face => {
        face.vertices.forEach(v => {
            if (visited.has(v)) return;
            v.pos[0] *= sx;
            v.pos[1] *= sy;
            v.pos[2] *= sz;
            visited.add(v);
        });
    });
    return mesh;
}

/**
 * Rotates the entire mesh around its internal origin.
 */
export function rotateMeshModifier(mesh, axis, angle) {
    if (!mesh || !mesh.faces) return mesh;
    const visited = new Set();
    const axisVec = axis === 'x' ? [1,0,0] : axis === 'y' ? [0,1,0] : [0,0,1];

    mesh.faces.forEach(face => {
        face.vertices.forEach(v => {
            if (visited.has(v)) return;
            v.pos = Vec3.rotate(v.pos, axisVec, angle);
            if (v.norm) v.norm = Vec3.rotate(v.norm, axisVec, angle);
            visited.add(v);
        });
    });
    return mesh;
}

/**
 * Translates the entire mesh. Crucial for shifting the origin to the feet.
 */
export function translateMeshModifier(mesh, translation) {
    if (!mesh || !mesh.faces || !translation || translation.length !== 3) return mesh;
    const visited = new Set();
    mesh.faces.forEach(face => {
        face.vertices.forEach(v => {
            if (visited.has(v)) return;
            v.pos = Vec3.add(v.pos, translation);
            visited.add(v);
        });
    });
    return mesh;
}
