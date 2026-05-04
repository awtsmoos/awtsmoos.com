
/**
 * B"H
 * @module SparksGatherer
 * @chapter Purifying the Emanation
 */

import { ApiPortal } from "/heichelos/post/comments/inline/loading/ApiPortal.js";
import { DataPurifier } from "/heichelos/post/comments/inline/loading/DataPurifier.js";

/**
 * @class SparksGatherer
 */
export class SparksGatherer {
    /**
     * @method collect
     * @description Gathers and purifies insights for an identity.
     */
    static async collect(alias, post) {
        try {
            console.log(`B"H - [SparksGatherer] Collecting sparks for @${alias}.`);
            const raw = await ApiPortal.fetchPostMap(alias, post);
            return DataPurifier.purify(raw);
        } catch (e) {
            console.error("B\"H - [SparksGatherer] Gathering rupture:", e);
            return [];
        }
    }
}
