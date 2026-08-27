
// B"H
/**
 * @file FirebaseHostingCompression.js
 * @chapter The Tzimtzum of Finite Matter
 * @description
 * "Let there be an expanse in the midst of the water."
 * 
 * Before infinite potential can dwell in finite reality, there must be a Tzimtzum (Contraction).
 * Google's Hosting servers decree that all uploaded matter MUST be contracted using Gzip.
 * If the matter is not contracted, the checksums will mismatch, and the 412 barrier will fall upon us.
 * 
 * This pure module utilizes Node's inner zlib to contract the soul of the data (Buffer) 
 * into its required Gzip vessel.
 */

const zlib = require("zlib");

class FirebaseHostingCompression {
    /**
     * @method applyTzimtzum
     * @description Contracts earthly strings or buffers into Gzip.
     * @param {Buffer|string} content - The inorganic soul waiting for elevation.
     * @returns {Promise<Buffer>} The contracted bytes.
     */
    static async applyTzimtzum(content) {
        return new Promise((resolve, reject) => {
            const bufferMatter = Buffer.isBuffer(content) 
                ? content 
                : Buffer.from(content, "utf8");

            zlib.gzip(bufferMatter, (err, contractedData) => {
                if (err) {
                    reject(new Error(`B"H: The Tzimtzum failed. The matter resisted contraction: ${err.message}`));
                } else {
                    resolve(contractedData);
                }
            });
        });
    }
}

module.exports = FirebaseHostingCompression;
