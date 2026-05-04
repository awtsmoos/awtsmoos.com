
/**
 * B"H
 * @module SparksGatherer
 * @chapter Tearing the Husks
 * @description
 * Often, the Infinite Light is wrapped in husks (Success/Details wrappers).
 * The SparksGatherer reaches into these wrappers and extracts the 
 * pure sparks of data, flattening maps into arrays for the weaver to use.
 * 
 * "Gather the fragments that nothing be lost."
 */

import { ApiPortal } from "./ApiPortal.js";
import { unrollApiResponse } from "../../logic/unroller.js";

/**
 * @class SparksGatherer
 */
export class SparksGatherer {
    /**
     * @method collect
     * @description
     * Orchestrates the fetching and purification of comment data.
     * 
     * @param {string} alias - The Guardian's name.
     * @param {Object} post - The post context.
     * @returns {Promise<Array>} - The purified array of insights.
     */
    static async collect(alias, post) {
        try {
            const raw = await ApiPortal.fetchPostMap(alias, post);
            const purified = unrollApiResponse(raw);

            console.log(`%c B"H - [SparksGatherer] Collected ${purified.length} purified sparks for @${alias}.`, "color: #ff99ff;");
            return purified;
        } catch (e) {
            console.error("B\"H - [SparksGatherer] Failure during collection:", e);
            return [];
        }
    }
}
