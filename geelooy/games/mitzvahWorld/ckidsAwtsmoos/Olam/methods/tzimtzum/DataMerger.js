
/**
 * B"H
 * @module DataMerger
 * @description
 * Before the physical manifestation begins, the spiritual DNA (data) must be assembled.
 * This module unites the system decrees, the player's history, and the innate physical 
 * constants into one unified essence ready for the Tzimtzum.
 */
import defaultConfig from "../../../defaultConfig.js";

export default class DataMerger {
    /**
     * @async
     * @function merge
     * @description Fuses the various data streams into a single source of truth.
     * @param {Object} systemInfo - Base engine parameters.
     * @param {Object} userInfo - Player-specific state and inventory.
     * @returns {Promise<Object>} The consolidated world data.
     */
    static async merge(systemInfo = {}, userInfo = {}) {
        console.log("B\"H - ⚡ INTENSE LOG: Merging Primordial Data...");
        let info = { ...systemInfo, ...userInfo };

        // Attempt to load from a Blob URL if one was passed, 
        // though our new pure flow bypasses this for instant manifestation.
        if (typeof info.worldDayuhURL === "string") {
            try {
                console.log("B\"H - ⚡ INTENSE LOG: Importing URL:", info.worldDayuhURL);
                const f = await import(info.worldDayuhURL);
                if (f?.default) {
                    Object.assign(info, f.default);
                    Object.assign(userInfo, f.default);
                }
            } catch (e) {
                console.error("B\"H - ⚡ INTENSE ERROR: Failed to import world URL:", info.worldDayuhURL, e);
            }
        }

        // Weave in the default configuration (Textures, base models, etc.)
        if (defaultConfig && defaultConfig.components) {
            info.components = {
                ...defaultConfig.components,
                ...(info.components || {})
            };
        }

        if (!info.nivrayim) {
            console.warn("B\"H - ⚡ INTENSE WARNING: No nivrayim found. Generating empty void.");
            info.nivrayim = {};
        }

        return info;
    }
}
