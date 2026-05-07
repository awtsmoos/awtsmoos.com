
/**
 * B"H
 * @module DataPurifier
 * @chapter Final Birur (Refinement)
 * @description
 * This module performs the final purification of the data before it is manifest 
 * in the DOM. Since the ApiPortal now handles batching and deduplication, 
 * this module ensures the results are truly a clean Array of Otiyot.
 */

import { unrollApiResponse } from "../../logic/unroller.js";

/**
 * @class DataPurifier
 */
export class DataPurifier {
    /**
     * @method purify
     * @description Ensures the incoming transmission is a pure, flat Array.
     */
    static purify(rawResponse) {
        if (Array.isArray(rawResponse)) return rawResponse;
        
        // Fallback for single-object emanations
        return unrollApiResponse(rawResponse);
    }
}
