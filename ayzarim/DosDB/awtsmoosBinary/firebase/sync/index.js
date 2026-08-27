
// B"H
/**
 * @file index.js
 * @description
 * The gateway to the Sync modules. Exposes the FirebaseSyncEngine so that 
 * any part of the application can initiate the Aliyah (elevation) of local 
 * files into the infinite expanse of the Firebase Realtime Database.
 */

const FirebaseSyncEngine = require("./FirebaseSyncEngine.js");

module.exports = {
    /**
     * @method syncToFirebase
     * @description Syncs a local folder directly to Firebase using a config file.
     * @param {string} targetDirectory - The local folder.
     * @param {string} configFilePath - Path to the Firebase config JSON.
     * @param {Function} [onProgress] - Callback for logging.
     */
    syncToFirebase: async (targetDirectory, configFilePath, onProgress) => {
        return await FirebaseSyncEngine.syncDirectory(targetDirectory, configFilePath, onProgress);
    },
    FirebaseSyncEngine
};
