// B"H
/**
 * @file VesselSanitizer.js
 * @brief The Refiner's Fire for Digital Labels.
 */

export const VesselSanitizer = {
    /**
     * B"H
     * Purifies a path or filename of illegal characters.
     */
    purify(rawLabel) {
        if (!rawLabel || typeof rawLabel !== 'string') return "";

        let clean = rawLabel.trim();

        // B"H - PURGE TRAILING DOTS AND WHITESPACE
        while ((clean.endsWith('.') || clean.endsWith(' ')) && clean.length > 0) {
            clean = clean.slice(0, -1).trim();
        }

        // PURGE ILLEGAL SYMBOLS
        const hostileMarks = /[<>:"\\|?*]/g;
        clean = clean.replace(hostileMarks, "_");

        return clean;
    }
};