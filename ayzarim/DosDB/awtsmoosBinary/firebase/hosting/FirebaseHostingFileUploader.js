
// B"H
/**
 * @file FirebaseHostingFileUploader.js
 * @chapter The Ascension of the Physical Bytes
 * @description
 * "He raises the poor from the dust."
 * 
 * Here we transcend to the specific Upload API: `upload-firebasehosting.googleapis.com`.
 * This was the location of the impenetrable 412 Precondition Failed barrier! 
 * By embedding the `access_token` in the query path, the Heavenly Gate believed the 
 * File Hash ended with the literal characters `?access_token=...` which mismatched 
 * the true Hex signature we provided in `populateFiles`.
 * 
 * We now weave the Bearer signature purely into the Headers, leaving the URL 
 * terminating immaculately upon the Hex string.
 */

const HttpRequest = require("../network/HttpRequest.js");
const HostingUrlFactory = require("./HostingUrlFactory.js");

class FirebaseHostingFileUploader {
    /**
     * @method uploadGzippedMatter
     * @description Hoists the gzipped bytes to the cloud.
     * @param {string} siteId - Site vessel.
     * @param {string} versionName - Full version string (sites/.../versions/1234)
     * @param {string} fileHash - SHA256 of the Gzip buffer.
     * @param {Buffer} gzippedBuffer - The literal bytes to transmit.
     * @param {Object} authHeaders - Header object carrying the Bearer token.
     * @param {Function} log - Tracker.
     */
    static async uploadGzippedMatter(siteId, versionName, fileHash, gzippedBuffer, authHeaders, log) {
        log(`[UPLOAD_START] B"H: Attempting to elevate ${gzippedBuffer.length} bytes to the Upload Gateway.`);
        
        // Factory provides absolute REST path ending purely in the Hash.
        const urlParams = HostingUrlFactory.buildUploadUrl(siteId, versionName, fileHash);

        // B"H: Spreading auth headers, then forcibly declaring the octet-stream nature of the body.
        const uploadHeaders = {
            ...authHeaders,
            "Content-Type": "application/octet-stream",
            "Content-Length": gzippedBuffer.length
        };

        await HttpRequest.send({
            hostname: urlParams.hostname,
            path: urlParams.path, // PURE! Untainted by query parameters.
            method: "POST",
            headers: uploadHeaders,
            body: gzippedBuffer
        });

        log(`[UPLOAD_SUCCESS] B"H: Bytes accepted gracefully by the Heavenly Upload Gateway.`);
    }
}

module.exports = FirebaseHostingFileUploader;
