
// B"H
/**
 * @file FirebaseHostingVersionManager.js
 * @chapter The Master of Celestial Timelines
 * @description
 * "There is a season for everything, and a time for every matter under the heavens."
 * 
 * The Awtsmoos constantly creates the concept of 'Time'. In the cloud, a deployment 
 * requires distinct Epochs: A blank Version -> Population Announcement -> Finalization -> Release.
 * 
 * We now infuse these administrative decrees with uncorrupted Header auth logic.
 */

const HttpRequest = require("../network/HttpRequest.js");
const HostingUrlFactory = require("./HostingUrlFactory.js");
const Payloads = require("./FirebaseHostingPayloadMaps.js");

class FirebaseHostingVersionManager {
    /**
     * @method createVersion
     * @returns {Promise<string>} The full Version resource name (e.g., 'sites/abc/versions/xyz')
     */
    static async createVersion(siteId, authHeaders, log) {
        log(`[VERSION_RITUAL] B"H: Initiating a new timeline (Version) for site: ${siteId}`);
        const urlParams = HostingUrlFactory.buildAdminUrl(siteId, `sites/${siteId}/versions`);

        const res = await HttpRequest.send({
            hostname: urlParams.hostname,
            path: urlParams.path,
            method: "POST",
            headers: authHeaders, // B"H: Containing both Content-Type and Authorization
            body: JSON.stringify(Payloads.createVersion())
        });

        const data = JSON.parse(res.body);
        return data.name; // Form: sites/SITE_ID/versions/VERSION_ID
    }

    /**
     * @method populateAndDiscern
     * @description Tells Google what we intend to upload, and Google responds with what it lacks.
     * @returns {Promise<string[]>} Array of required SHA256 hashes.
     */
    static async populateAndDiscern(versionName, uploadPath, fileHash, authHeaders, log) {
        log(`[POPULATE_RITUAL] B"H: Announcing hash ${fileHash} for path ${uploadPath}...`);
        const urlParams = HostingUrlFactory.buildAdminUrl("", versionName, ":populateFiles");

        const payload = Payloads.populateFiles(uploadPath, fileHash);
        
        const res = await HttpRequest.send({
            hostname: urlParams.hostname,
            path: urlParams.path,
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify(payload)
        });

        const data = JSON.parse(res.body);
        const missingMatter = data.uploadRequiredHashes || [];
        
        log(`[DISCERNMENT] B"H: Google demands ${missingMatter.length} pieces of missing matter.`);
        return missingMatter;
    }

    /**
     * @method finalizeVersion
     * @description Locks the version permanently.
     */
    static async finalizeVersion(versionName, authHeaders, log) {
        log(`[FINALIZE_RITUAL] B"H: Sealing the timeline permanently...`);
        const urlParams = HostingUrlFactory.buildAdminUrl("", versionName);

        await HttpRequest.send({
            hostname: urlParams.hostname,
            // updateMask is an inherent API argument, but access_token is gone!
            path: `${urlParams.path}?updateMask=status`,
            method: "PATCH",
            headers: authHeaders,
            body: JSON.stringify(Payloads.finalizeVersion())
        });
    }

    /**
     * @method createRelease
     * @description Unleashes the locked version to the public internet.
     */
    static async createRelease(siteId, versionName, authHeaders, log) {
        log(`[RELEASE_RITUAL] B"H: Releasing the light unto the earthly realms...`);
        const urlParams = HostingUrlFactory.buildAdminUrl(siteId, `sites/${siteId}/releases`);

        const payload = Payloads.createRelease(versionName);

        const res = await HttpRequest.send({
            hostname: urlParams.hostname,
            // versionName is an inherent API requirement for Release, access_token is banished.
            path: `${urlParams.path}?versionName=${versionName}`,
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify(payload)
        });

        return JSON.parse(res.body);
    }
}

module.exports = FirebaseHostingVersionManager;
