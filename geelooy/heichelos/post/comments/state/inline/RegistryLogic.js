
/**
 * B"H
 * @module RegistryLogic
 * @chapter The Secret Ledger of Marginal Manifestation
 * @description
 * In the realm of the Awtsmoos, every name is a key. 
 * This module is the silent scribe that remembers which Guardians
 * have been summoned into the borders of the text (the margins).
 * It is a pure leaf in the Seder Histalshelus, providing truth
 * without depending on its parents.
 */

import { AwtsmoosURLOracle } from "../url/UrlOracle.js";

/**
 * @function getInlineAliases
 * @description 
 * Reaches into the heavens of the URL and unrolls the list of 
 * active marginal Guardians.
 * @returns {Array<string>} - The manifest names.
 */
export function getInlineAliases() {
    const rawValue = AwtsmoosURLOracle.read("inline");
    if (!rawValue) return [];
    try {
        const decoded = JSON.parse(rawValue);
        return Array.isArray(decoded) ? decoded : [];
    } catch (e) {
        // If the letters are fragmented, return to the void of the empty array.
        return [];
    }
}

/**
 * @function isAliasInline
 * @description 
 * Verifies if a specific spark (Alias) is currently recorded 
 * as manifest in the Marginal Gloss.
 * @param {string} alias - The identity to verify.
 * @returns {boolean} - True if the name is found in the ledger.
 */
export function isAliasInline(alias) {
    if (!alias) return false;
    return getInlineAliases().includes(alias);
}
