
/**
 * @file VesselSanitizer.js
 * @brief The Refiner's Fire for Digital Labels.
 * 
 * CHAPTER I: THE PURGATION OF THE VOID
 * 
 * In the realm of Asiyah, where the Word takes on the heavy garments of the 
 * File System, certain characters are forbidden. 
 */

export const VesselSanitizer = {
    /**
     * B"H
     * Purifies a path or filename of illegal characters that trigger OS errors.
     * 
     * @param {string} rawLabel - The input path segment.
     * @returns {string} The cleansed label.
     */
    purify(rawLabel) {
        if (!rawLabel || typeof rawLabel !== 'string') return "";

        // Trim the void
        let clean = rawLabel.trim();

        // B"H - PURGE TRAILING DOTS
        // Many systems reject names ending in a dot (e.g. "CollisionDetection.")
        while (clean.endsWith('.') && clean.length > 0) {
            clean = clean.slice(0, -1).trim();
        }

        // PURGE ILLEGAL SYMBOLS
        // Replace < > : " \ | ? * with underscore
        const hostileMarks = /[<>:"\\|?*]/g;
        clean = clean.replace(hostileMarks, "_");

        return clean;
    }
};
