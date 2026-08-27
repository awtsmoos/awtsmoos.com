
// B"H
/**
 * @file ToFirebase.js
 * @description
 * Like preparing a soul to ascend to the higher Sefirot, we must strip away
 * that which cannot exist there. Buffers become base64, keys are sanitized.
 */

const { TypeMapToFirebase } = require("./SerializationTypeMap.js");
const KeySanitizer = require("../path/KeySanitizer.js");

class ToFirebase {
    /**
     * @method serialize
     * @description Recursively prepares data.
     * @param {any} data - Earthly data.
     * @returns {any} Heavenly JSON.
     */
    static serialize(data) {
        if (data === undefined || data === null) return null;

        // Apply data-driven specific transformations
        for (const strategy of TypeMapToFirebase) {
            if (strategy.check(data)) {
                return strategy.transform(data);
            }
        }

        if (Array.isArray(data)) {
            return data.map(item => ToFirebase.serialize(item));
        }

        if (typeof data === "object") {
            const result = {};
            for (const [key, value] of Object.entries(data)) {
                const safeKey = KeySanitizer.sanitize(key);
                result[safeKey] = ToFirebase.serialize(value);
            }
            return result;
        }

        return data; // Primitives
    }
}

module.exports = ToFirebase;
