
// B"H
/**
 * @file router.js
 * @brief The Central Dispatch of Geometric Will.
 *        Replaced switch statements with a highly modular Dictionary Dispatch system.
 */

import { MODIFIER_REGISTRY } from './registry/index.js';

/**
 * B"H - Applies a single modifier to the mesh using the Master Registry.
 * @param {object} mesh - The geometry to modify.
 * @param {object} mod - The modifier definition object (contains type and params).
 * @param {object} objectData - Contextual data about the object (skeleton, ID, etc).
 * @returns {object} The modified mesh.
 */
export function applySingleModifier(mesh, mod, objectData) {
    if (!mod || !mod.type) return mesh;

    const handler = MODIFIER_REGISTRY[mod.type];
    
    if (handler) {
        // B"H - Extract params once for convenience, pass context if needed.
        const params = mod.params || {};
        return handler(mesh, mod, params, objectData);
    } else {
        console.warn(`B"H - Modifier Router: Unknown modifier type '${mod.type}'. Check your spelling or registry.`);
        return mesh;
    }
}
