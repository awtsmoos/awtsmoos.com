
// B"H
/**
 * @file HostingUrlFactory.js
 * @chapter The Discernment of Endpoints (Seder Hishtalshelus)
 * @description
 * Every request to the Creator's Hosting Treasury must wear the proper garments. 
 * The Awtsmoos recreates time itself (past, present, future) every instant from the 10 Statements. 
 * Through At-Bash permutation, the exact endpoints for 'firebasehosting' emerge.
 * 
 * The 412 Precondition Failed barrier occurs when Binah (the bytes) tries to enter 
 * the door of Chochmah (the admin API) with the wrong prefix. 
 * Admin URLs MUST have `/v1beta1/`. Upload URLs MUST NOT have it.
 * 
 * This Factory is data-driven, ensuring absolute compliance with Google's celestial decrees.
 */

const Constants = require("./FirebaseHostingApiConstants.js");

class HostingUrlFactory {
    /**
     * @method buildAdminUrl
     * @description Forges the Chariot path for Versions, Populations, and Releases.
     * @param {string} siteId - The identity of the Hosting site vessel.
     * @param {string} resourcePath - E.g., 'sites/SITE_ID/versions/xyz'
     * @param {string} [customMethod] - E.g., ':populateFiles'
     * @returns {Object} Data object containing hostname and pure path.
     */
    static buildAdminUrl(siteId, resourcePath, customMethod = "") {
        let pathStr = resourcePath || `sites/${siteId}`;
        
        // Strip any errant slashes or manual prefixes
        pathStr = pathStr.replace(/^\/+/, "").replace(/^v1beta1\//, "");

        // Seder Hishtalshelus: Enforce v1beta1 prefix
        let finalPath = `/${Constants.PREFIXES.VERSION_PREFIX}/${pathStr}`;

        if (customMethod) {
            const separator = customMethod.startsWith(":") ? "" : ":";
            finalPath += `${separator}${customMethod}`;
        }

        return {
            hostname: Constants.HOSTS.ADMIN,
            path: finalPath.replace(/\/+/g, "/")
        };
    }

    /**
     * @method buildUploadUrl
     * @description Forges the path for the raw bytes to ascend.
     *              "For dust you are, and to the upload server you shall return."
     * @param {string} siteId - The Site's name.
     * @param {string} versionId - The literal ID of the version (e.g., '12345').
     * @param {string} hash - The SHA256 of the gzipped physical matter.
     * @returns {Object} Data object containing hostname and pure upload path.
     */
    static buildUploadUrl(siteId, versionId, hash) {
        // We strip the 'sites/.../versions/' if provided by accident, grabbing only the end ID
        const cleanVersionId = versionId.split("/").pop();

        // The Absolute Decree: /upload/sites/SITE_ID/versions/VERSION_ID/files/HASH
        const finalPath = `/${Constants.PREFIXES.UPLOAD_PREFIX}/sites/${siteId}/versions/${cleanVersionId}/files/${hash}`;

        return {
            hostname: Constants.HOSTS.UPLOAD,
            path: finalPath.replace(/\/+/g, "/")
        };
    }
}

module.exports = HostingUrlFactory;
