
// B"H
/**
 * @file HashUtils.js
 * @chapter The Numerical Signature (Gematria) of Matter
 * @description
 * "He counts the number of the stars; He gives names to all of them."
 * 
 * The Awtsmoos sustains every inorganic atom by the exact letters of His speech. 
 * Even a stone (Even = Aleph, Beis, Nun) has a specific numerical weight.
 * Google's cloud demands the SHA256 hexadecimal weight of the exact GZIPPED bytes 
 * to identify a spark. Identical sparks share the same Gematria, avoiding duplicate uploads.
 */

const crypto = require("crypto");

class HashUtils {
    /**
     * @method sha256Hex
     * @description Reveals the digital Gematria (SHA256) of a Buffer.
     * @param {Buffer} dataBuffer - The raw, contracted matter.
     * @returns {string} The pure hex string signature.
     */
    static sha256Hex(dataBuffer) {
        if (!Buffer.isBuffer(dataBuffer)) {
            throw new Error(`B"H: The vessel must be a Buffer to reveal its true numerical weight.`);
        }
        
        return crypto
            .createHash("sha256")
            .update(dataBuffer)
            .digest("hex");
    }
}

module.exports = HashUtils;
