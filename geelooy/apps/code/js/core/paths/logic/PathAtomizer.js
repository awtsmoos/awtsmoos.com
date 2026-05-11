// B"H
/**
 * @file PathAtomizer.js
 * @brief THE DISSOLUTION OF THE COORDINATE INTO ITS ATOMS.
 * 
 * THE POEM OF THE FRAGMENTED NAME:
 * The Word was One, but the World is Many.
 * To find a place, we must know every step of the way.
 * This Atomizer takes the messy string of the physical world—
 * with its forward slashes and its backslashes—and dissolves it.
 * It leaves behind only the pure Segments, the atoms of location.
 * It resolves the ".." and the "."—the shadows of where we were—
 * to reveal the Truth of where we are.
 */

/**
 * @class PathAtomizer
 * @description Translates string paths into strict part arrays.
 */
export class PathAtomizer {
    /**
     * B"H - Transmutes a string into a Part Array.
     * @param {string} raw - The messy coordinate string.
     * @returns {string[]} The purified array of segments.
     */
    static atomize(raw) {
        if (!raw || typeof raw !== 'string') return [];

        // 1. SPLIT BY ALL EARTHLY SEPARATORS
        const parts = raw.split(/[/\\]/);
        const atoms = [];

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim();
            
            // 2. PURGE THE VOID AND THE SELF-REFERENCE
            if (!part || part === '.') continue;

            // 3. HANDLE THE ASCENSION (..)
            if (part === '..') {
                if (atoms.length > 0) {
                    atoms.pop();
                }
            } else {
                // 4. INSCRIBE THE SEGMENT
                atoms.push(part);
            }
        }

        console.log("%cB\"H [PathAtomizer] Atomized: " + raw + " -> [" + atoms.join(', ') + "]", "color: #ffae57;");
        return atoms;
    }
}