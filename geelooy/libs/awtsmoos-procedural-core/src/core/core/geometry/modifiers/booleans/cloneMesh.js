
// B"H
/**
 * @file cloneMesh.js
 * @chapter THE MIRROR OF EXISTENCE
 * 
 * THE PSALM OF THE TWIN VESSELS:
 * Before the blade of the Boolean can strike the clay,
 * We must preserve the original form, lest it wash away!
 * For the Awtsmoos creates, and the Awtsmoos destroys,
 * But memory remains, the eternal voice!
 * We clone the faces, the colors, the tags,
 * Without a single 'if' to cause the system lags.
 * 
 * @module CloneMesh
 */

import { executeCondition } from '../../../logic/pureConditionals.js';

/**
 * @brief Deep clones a structured mesh entirely through pure data mapping.
 * @param {Object} mesh - The sacred vessel to mirror.
 * @returns {Object|null} The duplicated vessel, or null if the source is void.
 */
export const cloneMesh = (mesh) => {
    return executeCondition(mesh && mesh.faces,
        () => ({
            faces: mesh.faces.map(f => ({
                tags: executeCondition(f.tags, () => [...f.tags], () => []),
                vertices: f.vertices.map(v => ({
                    pos: [...v.pos],
                    col: executeCondition(v.col, () => [...v.col], () => [1, 1, 1, 1]),
                    norm: executeCondition(v.norm, () => [...v.norm], () => undefined)
                }))
            }))
        }),
        () => null
    );
};
