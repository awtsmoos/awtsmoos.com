
/**
 * B"H
 * @module InlineRegistry
 * @chapter The Official Ledger of the Border
 * @description
 * Every spark must be recorded in the high archives. 
 * This module is the Registry—the official authority that declares 
 * which Guardians are currently manifest in the borders of the text.
 */

import { fetchRawList } from "./GuardianFetcher.js";

/**
 * @class MarginalGuardianRegistry
 * @description The Sovereign authority for marginal state tracking.
 */
export class MarginalGuardianRegistry {
    /**
     * @method getActive
     * @description 
     * THE NAME IS HEALED. Returns the array of manifest Guardians.
     * @returns {Array<string>}
     */
    static getActive() {
        return fetchRawList();
    }

    /**
     * @method isPresent
     * @description Verifies if a Guardian is manifest.
     * @param {string} alias 
     * @returns {boolean}
     */
    static isPresent(alias) {
        if (!alias) return false;
        return this.getActive().includes(alias);
    }
}
