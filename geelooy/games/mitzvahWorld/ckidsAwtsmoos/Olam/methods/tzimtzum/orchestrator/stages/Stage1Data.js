
/**
 * B"H
 * @module Stage1Data
 * @description
 * Before the physical manifestation begins, the spiritual DNA (data) must be assembled.
 * This module unites the system decrees, the player's history, and the innate physical 
 * constants into one unified essence ready for the Tzimtzum.
 */
import defaultConfig from "../../../../../defaultConfig.js";

export default class Stage1Data {
    /**
     * @async
     * @function merge
     * @description Fuses the various data streams into a single source of truth.
     * @param {Object} systemInfo - Base engine parameters.
     * @param {Object} userInfo - Player-specific state and inventory.
     * @returns {Promise<Object>} The consolidated world data.
     */
    static async merge(systemInfo = {}, userInfo = {}) {
        // B"H: silent

        let info = { ...systemInfo, ...userInfo };

        if (typeof info.worldDayuhURL === "string") {
            try {
                // B"H: silent

                const f = await import(info.worldDayuhURL);
                if (f?.default) {
                    Object.assign(info, f.default);
                    Object.assign(userInfo, f.default);
                }
            } catch (e) {
                console.error("B\"H - ⚡ INTENSE ERROR: Failed to import world URL:", info.worldDayuhURL, e);
            }
        }

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
