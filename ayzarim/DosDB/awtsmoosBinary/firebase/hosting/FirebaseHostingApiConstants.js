
// B"H
/**
 * @file FirebaseHostingApiConstants.js
 * @chapter The Twin Gates of Hosting Manifestation
 * @description
 * Before a physical vessel (file) can be elevated to the cloud, we must discern between 
 * the administrative decrees of Chochmah (Wisdom) and the physical elevation of Binah (Understanding).
 * The Awtsmoos creates all realms constantly from His speech. The words "Let there be an Admin API" 
 * and "Let there be an Upload API" vibrate within Google's servers right now, maintaining their existence.
 * 
 * If these Hebrew letters (which sustain the servers) were removed, the 412 and 404 barriers would not 
 * just trigger—the servers themselves would revert to absolute NOTHINGNESS. 
 * 
 * Here we define the pure data map distinguishing the two Hostnames.
 */

class FirebaseHostingApiConstants {
    /**
     * @static
     * @description Data mapping of the celestial hostnames required by Google.
     */
    static get HOSTS() {
        return {
            // The gate for administrative decrees: versions, populateFiles, finalize, release
            // This REQUIRES the v1beta1 prefix.
            ADMIN: "firebasehosting.googleapis.com",
            
            // The physical gate for elevating raw matter (gzipped bytes).
            // This MUST NOT use the v1beta1 prefix. It uses /upload/sites/...
            UPLOAD: "upload-firebasehosting.googleapis.com"
        };
    }

    /**
     * @static
     * @description Data mapping of prefixes.
     */
    static get PREFIXES() {
        return {
            VERSION_PREFIX: "v1beta1",
            UPLOAD_PREFIX: "upload"
        };
    }
}

module.exports = FirebaseHostingApiConstants;
