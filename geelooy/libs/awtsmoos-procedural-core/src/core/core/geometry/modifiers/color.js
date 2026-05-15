
// B"H
/**
 * @file color.js
 * @brief The manifestation of Ohr (Divine Light) into the Kelim (Vessels).
 * 
 * CHAPTER 11: THE ASCENDING GRADIENT
 * From the foot of the mountain to the summit of white,
 * we bathe every vertex in the Creator's pure light.
 * The valley is green where the water flows deep,
 * while the heights of the spirit their snowy crowns keep.
 * This modifier applies the gradient of existence across the Y axis.
 */

import { queryFaces } from '../selection/faceQuery.js';

/**
 * B"H - Sets colors for specific faces or regions.
 * @param {object} mesh - The target structured mesh.
 * @param {object} options - Configuration { face, query, color }.
 */
export function setFaceColorModifier(mesh, options) {
    if (!mesh || !mesh.faces) return mesh;

    let targetFaces = [];
    
    if (options && options.face !== undefined) {
        targetFaces = [options.face];
    } else if (options && (options.query || options.faces)) {
        targetFaces = queryFaces(mesh, options.query || options.faces);
    } else {
        // Fallback: Color all faces
        for (let i = 0; i < mesh.faces.length; i++) targetFaces.push(i);
    }

    const color = (options && options.color) ? options.color : [1, 1, 1, 1];

    for (const faceIndex of targetFaces) {
        if (faceIndex >= 0 && faceIndex < mesh.faces.length) {
            const face = mesh.faces[faceIndex];
            if (face && face.vertices) {
                for (let i = 0; i < face.vertices.length; i++) {
                    face.vertices[i].col = [...color]; 
                }
            }
        }
    }
    
    return mesh;
}

/**
 * B"H - Colors vertices based on their Y height.
 * FIX: Now correctly handles the params object passed by the router.
 * @param {object} mesh - The target structured mesh.
 * @param {object} params - { min, max, colorLow, colorHigh }
 */
export function colorByHeightModifier(mesh, params = {}) {
    if (!mesh || !mesh.faces) return mesh;

    // B"H - Extracting parameters from the vessel, ensuring none are undefined.
    const minHeight = params.min !== undefined ? params.min : 0;
    const maxHeight = params.max !== undefined ? params.max : 10;
    const colorLow = params.colorLow || [0, 0, 0, 1];
    const colorHigh = params.colorHigh || [1, 1, 1, 1];

    const range = maxHeight - minHeight;
    const invRange = range !== 0 ? 1.0 / range : 0;

    const visited = new Set();

    mesh.faces.forEach(face => {
        face.vertices.forEach(v => {
            if (visited.has(v)) return;
            visited.add(v);

            let t = (v.pos[1] - minHeight) * invRange;
            t = Math.max(0, Math.min(1, t)); // Clamp the divine flow

            const r = colorLow[0] + (colorHigh[0] - colorLow[0]) * t;
            const g = colorLow[1] + (colorHigh[1] - colorLow[1]) * t;
            const b = colorLow[2] + (colorHigh[2] - colorLow[2]) * t;
            const a = colorLow[3] + (colorHigh[3] - colorLow[3]) * t;

            v.col = [r, g, b, a];
        });
    });
    return mesh;
}
