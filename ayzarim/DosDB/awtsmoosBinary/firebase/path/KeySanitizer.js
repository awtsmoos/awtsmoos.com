
// B"H
/**
 * @file KeySanitizer.js
 * @description
 * The active engine of permutation. It takes a key and runs it through the map,
 * transforming it so the Firebase realm does not reject our offerings.
 */

const { SanitizerReplacements, ReverseSanitizerReplacements } = require("./KeySanitizerMap.js");

class KeySanitizer {
    /**
     * @method sanitize
     * @description Purifies a key.
     * @param {string} key
     * @returns {string} Safe key.
     */
    static sanitize(key) {
        if (!key || typeof key !== "string") return "";
        let safeKey = key;
        // Data-driven string replacement
        for (const [forbidden, safe] of Object.entries(SanitizerReplacements)) {
            safeKey = safeKey.split(forbidden).join(safe);
        }
        return safeKey;
    }

    /**
     * @method unsanitize
     * @description Restores a key to its original, earthly form.
     * @param {string} safeKey
     * @returns {string} Original key.
     */
    static unsanitize(safeKey) {
        if (!safeKey || typeof safeKey !== "string") return "";
        let originalKey = safeKey;
        for (const [safe, forbidden] of Object.entries(ReverseSanitizerReplacements)) {
            originalKey = originalKey.split(safe).join(forbidden);
        }
        return originalKey;
    }
}

module.exports = KeySanitizer;
