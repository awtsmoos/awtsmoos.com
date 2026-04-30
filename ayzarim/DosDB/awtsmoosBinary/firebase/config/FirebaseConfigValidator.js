
// B"H
/**
 * @file FirebaseConfigValidator.js
 * @description
 * "The voice of the Lord is upon the waters."
 * 
 * In the realm of emanation, the name is the channel. You have returned to the 
 * "Regular" Firestore—the path of standard Native mode. In this path, the 
 * foundation of the project is almost always named `(default)`.
 * 
 * We have updated the validator to establish `(default)` (with parentheses) 
 * as the default database ID. This aligns our earthly requests with the 
 * standard heavenly architecture of Firebase, while still allowing a 
 * specific name to be provided if a multi-database project is used.
 */

class FirebaseConfigValidator {
    /**
     * @method validate
     * @description Ensures the config vessel is properly shaped to hold the light.
     * @param {Object} inputConfig - Raw JSON from the King's treasury.
     * @returns {Object} Normalized config.
     */
    static validate(inputConfig = {}) {
        if (typeof inputConfig !== "object" || inputConfig === null) {
            throw new Error("B\"H: The configuration must be a valid object.");
        }

        const normalized = { ...inputConfig };

        // 1. Detect raw Service Account signature
        const isRawServiceAccount = !!(inputConfig.private_key && inputConfig.client_email);
        
        if (isRawServiceAccount && !normalized.serviceAccount) {
            normalized.serviceAccount = {
                project_id: inputConfig.project_id,
                client_email: inputConfig.client_email,
                private_key: inputConfig.private_key
            };
        }

        // 2. Discerner of the Database Path
        if (!normalized.type || normalized.type === "service_account") {
            if (normalized.databaseURL) {
                normalized.type = "rtdb";
            } else if (normalized.project_id || (normalized.serviceAccount && normalized.serviceAccount.project_id)) {
                normalized.type = "firestore";
            }
        }

        // 3. Establishing the Name of the Foundation
        if (!normalized.rootNamespace) {
            normalized.rootNamespace = "awtsmoos";
        }
        
        if (normalized.type === "firestore" && !normalized.databaseId) {
            /**
             * B"H: Defaulting to the standard '(default)' name.
             * This is the default state of the regular Firestore vessel.
             */
            normalized.databaseId = "(default)"; 
        }

        return normalized;
    }
}

module.exports = FirebaseConfigValidator;
