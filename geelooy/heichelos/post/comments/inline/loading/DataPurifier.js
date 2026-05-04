
/**
 * B"H
 * @module DataPurifier
 * @chapter Tearing the Kelipot
 * @description
 * Data often arrives wrapped in 'shells' (Kelipot) of status codes and 
 * meta-wrappers. The DataPurifier is the Kohen that reaches into the vessel, 
 * identifies the essence (the actual insights), and unrolls it into 
 * a pure, flattened array of sparks.
 * 
 * "Extracting the sparks from the husks."
 */

import { unrollApiResponse } from "../../logic/unroller.js";

/**
 * @class DataPurifier
 */
export class DataPurifier {
    /**
     * @method purify
     * @description
     * Takes the raw API emanation and returns a purified array of insights.
     * 
     * @param {Object} rawResponse - The raw data from the ApiPortal.
     * @returns {Array} - The purified sparks.
     */
    static purify(rawResponse) {
        const sparks = unrollApiResponse(rawResponse);
        console.log(`%c B"H - [DataPurifier] Purified ${sparks.length} sparks of insight.`, "color: #ff99ff;");
        return sparks;
    }
}
