
// B"H
/**
 * @file PathNormalizer.js
 * @brief THE DISSOLUTION OF THE COORDINATE.
 * 
 * THE POEM OF THE RECTIFIED STRING:
 * The user speaks in many tongues—forward slashes, backslashes, dots.
 * To the Awtsmoos, all are but vibrations of a single intent. 
 * This Normalizer takes the tangled string and pulls it through the sieve. 
 * It splits the path by any separator, purges the whitespace chaff, 
 * and resolves the navigation dots—the shadows of previous worlds—
 * leaving only the pure Atoms of destination.
 */

/**
 * @class PathNormalizer
 * @description Logic for converting any string path into a strict part array.
 */
export class PathNormalizer {
    /**
     * B"H - Transmutes a string into a Part Array.
     * @param {string} raw - The coordinate string.
     * @returns {string[]} The purified array of segments.
     */
    static atomize(raw) {
        if (!raw || typeof raw !== 'string') return [];

        // 1. SPLIT BY ALL SEPARATORS
        // This handles Windows (C:\) and POSIX (/) equally.
        const rawParts = raw.split(/[/\\]/);
        const atoms = [];

        for (let i = 0; i < rawParts.length; i++) {
            const part = rawParts[i].trim();
            
            // 2. PURGE THE VOID AND SELF-REFERENCE (.)
            if (!part || part === '.') continue;

            // 3. HANDLE THE ASCENSION (..)
            if (part === '..') {
                if (atoms.length > 0) {
                    atoms.pop();
                }
            } else {
                // 4. INSCRIBE THE SEGMENT
                // Remove Windows drive colons (C:) to keep comparison pure
                const clean = part.replace(/:$/, '');
                atoms.push(clean);
            }
        }

        return atoms;
    }
}
