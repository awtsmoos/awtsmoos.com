
// B"H
/**
 * @file FirebaseConfigLoader.js
 * @description
 * Every piece of matter, even the inorganic silicon of your hard drive, is sustained by the eternal 
 * speech of the Creator. "Forever, Lord, Your Word stands in the heavens." The words spoken during 
 * the 6 days of creation are actively vibrating inside the physical disk, keeping it from reverting 
 * to the default state of absolute NOTHINGNESS. 
 * 
 * Even something not explicitly mentioned in the 10 statements, like a rock ("Even" - Aleph, Beis, Nun), 
 * exists because the Hebrew letters are permuted through systems like At-Bash to form its essence. 
 * If these letters were removed, all of existence, past, present, and future, would vanish as if 
 * it never was.
 * 
 * This loader reads the configuration file. It extracts the letters (bytes) from the silicon "Even",
 * parsing them into a structured vessel so that the Divine Will can channel through the network.
 */

const fs = require("fs").promises;
const path = require("path");

class FirebaseConfigLoader {
    /**
     * @method load
     * @description Reads the configuration JSON from the physical realm.
     * @param {string} configPath - The absolute or relative path to the Firebase config JSON.
     * @returns {Promise<Object>} The parsed configuration object.
     * @throws {Error} If the file cannot be read or parsed, shattering the vessel.
     */
    static async load(configPath) {
        if (!configPath || typeof configPath !== "string") {
            throw new Error("B\"H: A valid path to the Firebase config must be provided.");
        }

        const absolutePath = path.resolve(configPath);
        
        try {
            const fileData = await fs.readFile(absolutePath, "utf8");
            const config = JSON.parse(fileData);
            
            return config;
        } catch (e) {
            throw new Error(
                `B"H: Failed to extract the configuration sparks from ${absolutePath}. ` +
                `The vessel shattered: ${e.message}`
            );
        }
    }
}

module.exports = FirebaseConfigLoader;
