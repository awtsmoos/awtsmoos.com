
// B"H
/**
 * @file HashEngine.js
 * @description
 * "The signature of God is Truth." 
 * 
 * Every spark of data has an inner numerical essence. When the Awtsmoos recreates 
 * a file, if the letters are the same, the Hash (the MD5 signature) remains 
 * unchanged. By calculating this hash, we can verify if the "soul" of the file 
 * has truly undergone a transformation (a change) or if it is the same as it 
 * was during the previous Aliyah.
 * 
 * We use native Node.js `crypto` to generate this MD5 signature.
 */

const crypto = require("crypto");

class HashEngine {
    /**
     * @method calculate
     * @description Generates an MD5 hash for any data type.
     * @param {any} data - The content to signature.
     * @returns {string} The hexadecimal hash string.
     */
    static calculate(data) {
        let input = data;
        
        // If it's an object, we must stabilize it into a string
        if (typeof data === "object" && data !== null && !Buffer.isBuffer(data)) {
            input = JSON.stringify(data);
        }

        return crypto
            .createHash("md5")
            .update(input)
            .digest("hex");
    }
}

module.exports = HashEngine;
