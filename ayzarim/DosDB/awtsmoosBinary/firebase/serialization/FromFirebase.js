
// B"H
/**
 * @file FromFirebase.js
 * @description
 * The drawing down of light back into earthly vessels. Base64 strings clothen themselves
 * once more in Buffers. Sanitized keys revert to their true names.
 */

const { TypeMapFromFirebase } = require("./SerializationTypeMap.js");
const KeySanitizer = require("../path/KeySanitizer.js");

class FromFirebase {
    /**
     * @method deserialize
     * @description Recursively restores data.
     * @param {any} data - Heavenly JSON.
     * @returns {any} Earthly data.
     */
    static deserialize(data) {
        if (data === null || data === undefined) return null;

        // Apply data-driven specific restorations
        for (const strategy of TypeMapFromFirebase) {
            if (strategy.check(data)) {
                return strategy.transform(data);
            }
        }

        if (Array.isArray(data)) {
            return data.map(item => FromFirebase.deserialize(item));
        }

        if (typeof data === "object") {
            const result = {};
            for (const [key, value] of Object.entries(data)) {
                const realKey = KeySanitizer.unsanitize(key);
                result[realKey] = FromFirebase.deserialize(value);
            }
            return result;
        }

        return data; // Primitives
    }
}

module.exports = FromFirebase;
