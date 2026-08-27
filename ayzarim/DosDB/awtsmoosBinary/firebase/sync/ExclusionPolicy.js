
// B"H
/**
 * @file ExclusionPolicy.js
 * @chapter The Perfect Havdalah
 * @description
 * "And God saw the light, that it was good; and God divided the light from the darkness."
 * 
 * To ensure the Aliyah is pure, we must separate the 'Sparks of Content' 
 * from the 'System Vessels'. The Ledger file and the internal '.awts' 
 * shards are strictly for the world of Asiyah (local disk).
 */

const path = require("path");

class ExclusionPolicy {
    /**
     * @constant {string[]}
     * @description Forbidden signatures that must remain in the lower world.
     */
    static FORBIDDEN_NAMES = [
        ".awtsmoos_sync_ledger.json",
        "master.awts",
        "index.awts"
    ];

    /**
     * @method shouldExclude
     * @description Discerns the nature of a path with total precision.
     * @param {string} relativePath - The path from the inventory.
     * @returns {boolean} True if the vessel is forbidden from the cloud.
     */
    static shouldExclude(relativePath) {
        if (!relativePath) return true;
        
        // B"H: Normalize and extract the base name
        const normalized = relativePath.replace(/\\/g, '/');
        const fileName = path.basename(normalized);
        
        // 1. Check for specific system names
        if (ExclusionPolicy.FORBIDDEN_NAMES.includes(fileName)) {
            return true;
        }

        // 2. Exclude shards (shard-X.awts, index-X.awts)
        if (fileName.endsWith(".awts") && (fileName.includes("shard-") || fileName.includes("index-"))) {
            return true;
        }

        // 3. Exclude hidden system files, except allow specific data files if needed
        if (fileName.startsWith(".") && fileName !== ".awtsmoos_sync_ledger.json") {
            return true;
        }

        return false;
    }
}

module.exports = ExclusionPolicy;
