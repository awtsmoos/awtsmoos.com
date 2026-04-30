
// B"H
/**
 * @file resolution.js
 * @description 
 * Chapter 15: The Path through the Wilderness.
 * 
 * "The voice of one crying in the wilderness: Prepare the way of the Lord!" 
 * For the Light to descend into the vessels of the database, the path must be 
 * paved with absolute precision. A single misplaced dot or slash is like a 
 * hairline fracture in a sapphire—it shatters the flow of energy. 
 * 
 * This Resolution Engine is the scribe of the path. It knows that to find 
 * the Crown (Keter), it must ascend from the inner chamber (core), past 
 * the door of the vessel (handle), and out through the gate of the domain (api), 
 * until it reaches the Root where the Blueprints (utils) are stored. 
 * 
 * "The words of our G-d are eternal." We re-align the compass of this script 
 * so that it correctly points to the source of its being. By fixing these 
 * paths, the engine resumes its holy task of unsealing the binary coordinate 
 * scrolls, allowing the data to take its rightful form in the mind of the 
 * user.
 */

const Pointer = require('../../../utils/pointer/crown.js');
const IdentityAnchor = require('../../../structure/anchor/stable.js');
const constants = require('../../../constants.js');

/**
 * @class ResolutionEngine
 * @description
 * The sage who interprets the signs of the Crown and the Foundation. 
 * It nullifies the physical distance between the file path and the RAM, 
 * resolving the binary into revealed concept.
 */
class ResolutionEngine {
    /**
     * @method resolve
     * @description
     * Discerns the dwelling place of the data spark. It translates the raw 
     * Buffer seal into a manifest Coordinate object.
     * 
     * @param {Object} state - The internal soul-state of the LiveHandle.
     * @param {Object} state.db - The cosmic database instance.
     * @param {Buffer} state.ptr - The raw binary coordinate seal.
     * @param {number} state.type - The archetype ID of the spark.
     * @param {Object|null} state.actualPtr - The final revealed coordinate {type, offset, length}.
     * @param {number|null} state.actualType - The final revealed archetype.
     * @returns {void}
     */
    static resolve(state) {
        // B"H: If the Light has already found its body and stands revealed, 
        // we do not disturb its presence.
        if (state.actualPtr && typeof state.actualPtr === 'object' && !Buffer.isBuffer(state.actualPtr)) {
            return;
        }

        /** @type {Object} The Alchemical Recipes for Revelation. */
        const Rites = {
            /** 
             * Mode: ANCHOR (Yesod)
             * Ascends through the fixed portal of a 32-byte physical anchor.
             */
            [constants.VAL_TYPE.ANCHOR]: () => {
                const anchorManager = new IdentityAnchor(state.db);
                const result = anchorManager.resolve(state.ptr);
                if (result) {
                    state.actualPtr = result;
                    state.actualType = result.type;
                }
            },

            /** 
             * Mode: DIRECT (Crown)
             * Deciphers the variable-length code written directly into the seal.
             */
            'default': () => {
                if (Buffer.isBuffer(state.ptr)) {
                    const result = Pointer.decode(state.ptr);
                    if (result) {
                        state.actualPtr = result;
                        state.actualType = result.type;
                    }
                } else {
                    // When the coordinate has already shed its binary garments in earlier rituals.
                    state.actualPtr = state.ptr;
                    state.actualType = state.type;
                }
            }
        };

        const execute = Rites[state.type] || Rites['default'];
        execute();
    }
}

module.exports = ResolutionEngine;
