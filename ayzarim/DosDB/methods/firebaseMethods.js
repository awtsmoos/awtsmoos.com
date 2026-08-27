
// B"H
/**
 * @file firebaseMethods.js
 * @description
 * Integrates the Firebase synchronization capabilities directly into the DosDB class instance.
 * By merging these methods, the Database itself gains the power to elevate its local contents
 * into the Heavenly Cloud (Firebase) at the command of the user.
 * 
 * Every file synced is a spark returned to its source, sustained by the Creator's continuous speech.
 */

const { syncToFirebase } = require("../awtsmoosBinary/firebase/index.js");
const path = require("path");

module.exports = {
    /**
     * @method syncToFirebase
     * @description Synchronizes a directory within the database (or the whole database) to Firebase.
     * @param {string} relativePath - The path within the DB to sync (use "/" for the root).
     * @param {string} configFilePath - The absolute or relative path to the Firebase config JSON file.
     * @param {Function} [onProgress] - Optional callback to monitor the spiritual ascent of files.
     * @returns {Promise<Object>} The results of the sync operation.
     */
    async syncToFirebase(relativePath = "/", configFilePath, onProgress = null) {
        try {
            // Resolve the target directory relative to the DB root
            const targetDirectory = await this.getAwtsmoosFilePath(relativePath, true, false);
            
            // Initiate the elevation process
            const result = await syncToFirebase(targetDirectory, configFilePath, onProgress);
            
            return {
                success: true,
                message: `B"H: Successfully elevated ${result.syncedFiles} out of ${result.totalFiles} sparks to Firebase.`,
                details: result
            };
        } catch (e) {
            return {
                error: {
                    message: `B"H: The Aliyah (elevation) failed. The vessels could not contain the light.`,
                    details: e.message,
                    stack: e.stack
                }
            };
        }
    }
};
