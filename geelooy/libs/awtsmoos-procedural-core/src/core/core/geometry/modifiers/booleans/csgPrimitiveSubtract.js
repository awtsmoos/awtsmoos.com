
// B"H
/**
 * @file csgPrimitiveSubtract.js
 * @chapter THE UNIFICATION OF THE STRIKE
 * 
 * THE PSALM OF THE FLEXIBLE BLADE:
 * Sometimes we summon a primitive from the void's deep store,
 * And sometimes we carry a custom vessel to the floor!
 * This module now correctly discerns the intent of the Master.
 * If a 'customMesh' is provided, it is used directly, 
 * preventing the manifestation of a generic block and avoiding disaster!
 * 
 * @module CSGPrimitiveSubtract
 */

import { generateCutterPrimitive } from './csgPrimitiveFactory.js';
import { applyCutterTransforms } from './csgPrimitiveTransform.js';
import { performSafeCSGSubtract } from './csgSubtract.js';

/**
 * @brief Instantiates, transforms, and subtracts a primitive OR custom mesh.
 * 
 * THE TIKKUN: This function now prioritizes 'params.customMesh'. 
 * If it exists, we skip the primitive factory entirely.
 * 
 * @param {Object} mesh - The target mesh to be carved.
 * @param {Object} params - { primitive, customMesh, transform, insideTag }
 * @returns {Object} The carved vessel.
 */
export const performPrimitiveCSGSubtract = (mesh, params) => {
    console.log(`B"H - ⚔️ [CSGSubtract]: Preparing the strike...`);

    // 1. Resolve the source of the Cutter
    // If the Master provided a pre-tagged 'customMesh' (like the MouthChisel), we honor it!
    const rawCutter = params.customMesh || generateCutterPrimitive(params.primitive, params.parameters);
    
    if (params.customMesh) {
        console.log(`      -> 🛠️ Using specialized Custom Mesh for the cut.`);
    } else {
        console.log(`      -> 📦 Using standard Primitive [${params.primitive}] for the cut.`);
    }

    // 2. Align the Cutter in the World of the Target
    const transformedCutter = applyCutterTransforms(rawCutter, params.transform);
    
    // 3. Execute the Cleaving
    return performSafeCSGSubtract(mesh, transformedCutter, params.insideTag);
};
