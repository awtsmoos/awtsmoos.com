
/**
 * B"H
 * @module GuardianFetcher
 * @chapter The Extraction of Hidden Names
 * @description
 * "He calls them all by name" (Isaiah 40:26). 
 * This microscopic vessel reachers into the 'Oracle' of the URL 
 * to bring back the raw list of Guardians who have been called 
 * into marginal manifestation.
 */

import { AwtsmoosURLOracle } from "../url/Manager.js";

/**
 * @function fetchRawList
 * @description 
 * Reaches into the Heavens (URL) and unrolls the list of active Guardians.
 * @returns {Array<string>} - The names currently manifest.
 */
export function fetchRawList() {
    const rawValue = AwtsmoosURLOracle.read("inline");
    if (!rawValue) return [];
    try {
        const decoded = JSON.parse(rawValue);
        return Array.isArray(decoded) ? decoded : [];
    } catch (e) {
        // If the letters are fragmented, we return to the void of the empty array.
        return [];
    }
}
