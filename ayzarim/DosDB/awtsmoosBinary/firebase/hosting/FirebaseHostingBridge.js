
// B"H
/**
 * @file FirebaseHostingBridge.js
 * @chapter The Master Chariot of Firebase Hosting
 * @description
 * "Let the dry land appear!"
 * 
 * This bridge unifies the fragmented operations of Tzimtzum (compression),
 * Hashes (signatures), and the exact Seder (order) of the Google REST API.
 * 
 * We have learned from the Gevurah (severity) of the 412 Error: The Upload API 
 * cannot bear the `?access_token=` query string upon its path! We now distill the 
 * pure Bearer Token from the Auth Strategy and place it securely in the HTTP Headers, 
 * leaving the Sacred Path of the bytes entirely uncorrupted.
 */

const SiteManager = require("./FirebaseHostingSiteManager.js");
const Compression = require("./FirebaseHostingCompression.js");
const HashUtils = require("../network/HashUtils.js");
const VersionManager = require("./FirebaseHostingVersionManager.js");
const Uploader = require("./FirebaseHostingFileUploader.js");

class FirebaseHostingBridge {
    /**
     * @constructor
     * @param {string} projectId 
     * @param {Object} authStrategy - For fetching access tokens.
     */
    constructor(projectId, authStrategy) {
        this.projectId = projectId;
        this.authStrategy = authStrategy;
        this.siteId = projectId; // Default convention: Site ID is the Project ID
    }

    /**
     * @method deployHeavyFile
     * @description Elevates a single heavy spark to the public internet via Hosting.
     * @param {string} localRelativePath - The earthly name of the file (e.g. 'heavy/os.zip').
     * @param {Buffer|string} content - The inner soul of the file.
     * @param {Function} log - Tracker callback.
     * @returns {Promise<string>} The final, public internet URL.
     */
    async deployHeavyFile(localRelativePath, content, log) {
        log(`\n======================================================`);
        log(`[HOSTING_INIT] B"H: Beginning extreme Aliyah for Heavy Spark: ${localRelativePath}`);

        // B"H: Purifying the Auth Strategy to extract raw headers, abandoning path corruption
        let rawToken = "";
        if (typeof this.authStrategy._getToken === "function") {
            rawToken = await this.authStrategy._getToken();
        } else {
            const query = await this.authStrategy.getAuthQueryString();
            rawToken = decodeURIComponent(query.replace("access_token=", "").replace("auth=", ""));
        }

        const authHeaders = {
            "Authorization": `Bearer ${rawToken}`,
            "Content-Type": "application/json"
        };

        // Step 0: Ensure the project has the Site ready.
        await SiteManager.ensureSiteExists(this.projectId, this.siteId, authHeaders, log);

        // Step 1: Tzimtzum - Gzip the matter. MUST BE DONE BEFORE HASHING!
        log(`[TZIMTZUM] B"H: Contracting infinite data into finite Gzip format...`);
        const gzippedBuffer = await Compression.applyTzimtzum(content);

        // Step 2: Divine Gematria - Hash the GZIPPED matter.
        const hash = HashUtils.sha256Hex(gzippedBuffer);
        log(`[GEMATRIA] B"H: Pure numerical signature calculated: ${hash}`);

        // Step 3: Purify path for cloud
        const cleanName = localRelativePath.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const hostingRelativePath = `/${cleanName}`;

        // Step 4: The Timeline Genesis (Create Version)
        const versionName = await VersionManager.createVersion(this.siteId, authHeaders, log);

        // Step 5: The Population Announcement (Ask Google if it needs this)
        const requiredHashes = await VersionManager.populateAndDiscern(
            versionName, 
            hostingRelativePath, 
            hash, 
            authHeaders, 
            log
        );

        // Step 6: Conditional Elevation (Physical Upload)
        if (requiredHashes.includes(hash)) {
            await Uploader.uploadGzippedMatter(
                this.siteId, 
                versionName, 
                hash, 
                gzippedBuffer, 
                authHeaders, 
                log
            );
        } else {
            log(`[SKIP_ELEVATION] B"H: The Heavenly Cloud already recalls this matter. Upload bypassed.`);
        }

        // Step 7: Finalize & Release
        await VersionManager.finalizeVersion(versionName, authHeaders, log);
        await VersionManager.createRelease(this.siteId, versionName, authHeaders, log);

        // Calculate and Return final Public Link
        const publicUrl = `https://${this.siteId}.web.app${hostingRelativePath}`;
        log(`[ALIYAH_COMPLETE] B"H: The Spark has become Public Light at: ${publicUrl}`);
        log(`======================================================\n`);
        
        return publicUrl;
    }
}

module.exports = FirebaseHostingBridge;
