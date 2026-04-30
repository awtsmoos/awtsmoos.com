
// B"H
/**
 * @file FirebaseHostingPayloadMaps.js
 * @chapter The Blueprints of Atzilus (Emanation)
 * @description
 * Before an action is taken, its perfect thought exists in the mind of the Creator.
 * These are the exact JSON blueprints (Payloads) demanded by Google Hosting.
 * 
 * We have learned from the harsh decree of Gevurah (the 400 Error): When we invoke the 
 * Version Name directly within the Heavenly Path (Query String), we must NOT command the 
 * Release `type` in the body. Doing so implies a contradiction in the Divine Will.
 * The vessel must be stripped of this redundant decree.
 * 
 * No placeholders. Only pure object blueprints returning the correct configuration.
 */

class FirebaseHostingPayloadMaps {
    /**
     * @method createVersion
     * @description The decree commanding the creation of a new, empty Version vessel.
     *              The infinite light descends to establish a timeline that accepts all matter.
     * @returns {Object} The JSON payload.
     */
    static createVersion() {
        return {
            status: "CREATED",
            config: {
                headers:[{
                    glob: "**",
                    headers: {
                        "Cache-Control": "max-age=1800"
                    }
                }]
            }
        };
    }

    /**
     * @method populateFiles
     * @description The map dictating which physical signatures we intend to upload.
     *              "He counts the number of the stars..."
     * @param {string} path - The relative URL path (e.g., '/heavy-file.zip')
     * @param {string} hash - The SHA256 of the gzipped bytes.
     * @returns {Object} The JSON payload.
     */
    static populateFiles(path, hash) {
        return {
            files: {
                [path]: hash
            }
        };
    }

    /**
     * @method finalizeVersion
     * @description The seal set upon the Version once all bytes have ascended.
     *              This solidifies the timeline.
     * @returns {Object} The JSON payload.
     */
    static finalizeVersion() {
        return {
            status: "FINALIZED"
        };
    }

    /**
     * @method createRelease
     * @description The command to make the finalized Version public.
     *              B"H: Corrected to remove the `type` attribute, as requested by the REST API
     *              when `versionName` is explicitly provided in the URI.
     * @param {string} versionName - The full version resource name (used in logs/context).
     * @returns {Object} The purely corrected JSON payload.
     */
    static createRelease(versionName) {
        return {
            // B"H: The 'type' attribute is forbidden here. Only the message is permitted to remain.
            message: "B\"H: Elevated by Awtsmoos Sync Engine."
        };
    }
}

module.exports = FirebaseHostingPayloadMaps;
