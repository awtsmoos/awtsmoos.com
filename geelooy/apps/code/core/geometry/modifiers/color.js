
// B"H
/**
 * @file color.js
 * @brief The manifestation of Hue through Divine Speech.
 * 
 * THE HYMN OF COLOR:
 * From the silence of the Void, the Word begins to glow,
 * Painting every facet where the living waters flow.
 * No error shall be found here, no shadow in the plan,
 * For the Light is all-pervading since the world of thought began.
 */
import { queryFaces } from '../selection/faceQuery.js';

/**
 * Saturates geometric vessels with the light of color.
 * @param {object} mesh - The geometric soul awaiting its hue.
 * @param {object} options - The decree of revelation.
 */
export function setFaceColorModifier(mesh, options) {
    if (!mesh || !mesh.faces) return mesh;

    let targetFaces = [];
    const color = (options && options.color) ? options.color : [1, 1, 1, 1];

    // B"H - Determine targets: Query, specific face, or the whole creation.
    if (options && (options.query || options.faces)) {
        targetFaces = queryFaces(mesh, options.query || options.faces);
    } else if (options && options.face !== undefined) {
        targetFaces = [options.face];
    } else {
        // Encompass the whole mesh if no boundaries were spoken.
        for (let i = 0; i < mesh.faces.length; i++) targetFaces.push(i);
    }

    targetFaces.forEach(faceIndex => {
        if (faceIndex >= 0 && faceIndex < mesh.faces.length) {
            const face = mesh.faces[faceIndex];
            if (face && face.vertices) {
                face.vertices.forEach(v => {
                    v.col = [...color];
                });
            }
        }
    });
    
    return mesh;
}

/**
 * Applies a gradient of creation across the Y axis.
 */
export function colorByHeightModifier(mesh, minHeight, maxHeight, colorLow, colorHigh) {
    const range = maxHeight - minHeight;
    const invRange = range !== 0 ? 1.0 / range : 0;

    mesh.faces.forEach(face => {
        face.vertices.forEach(v => {
            let t = Math.max(0, Math.min(1, (v.pos[1] - minHeight) * invRange));
            v.col = [
                colorLow[0] + (colorHigh[0] - colorLow[0]) * t,
                colorLow[1] + (colorHigh[1] - colorLow[1]) * t,
                colorLow[2] + (colorHigh[2] - colorLow[2]) * t,
                colorLow[3] + (colorHigh[3] - colorLow[3]) * t
            ];
        });
    });
    return mesh;
}
