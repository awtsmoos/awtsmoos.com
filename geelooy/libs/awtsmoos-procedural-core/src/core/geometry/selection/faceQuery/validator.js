
// B"H
/**
 * @file validator.js
 * @chapter THE GATE OF DISCERNMENT
 * 
 * THE PSALM OF THE GATEKEEPER:
 * Before the light of the query can enter the form,
 * We must ensure the vessel has weathered the storm!
 * A mesh without faces is a ghost in the night,
 * And a query without params carries no light.
 * The Validator speaks true, returning purely the state,
 * So the Router may safely open the gate!
 * 
 * @module QueryValidator
 */

/**
 * @brief Evaluates the physical validity of the mesh and the query.
 * @param {Object} mesh - The geometric vessel.
 * @param {Object|Array} queryOpts - The divine intent.
 * @returns {boolean} True if existence is valid, false if void.
 */
export const validateQueryInput = (mesh, queryOpts) => {
    return !!(mesh && mesh.faces && mesh.faces.length > 0 && queryOpts);
};
