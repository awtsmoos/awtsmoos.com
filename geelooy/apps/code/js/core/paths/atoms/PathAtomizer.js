
// B"H
/**
 * @file PathAtomizer.js
 * @brief THE DISSOLUTION OF THE COORDINATE.
 * 
 * THE POEM OF THE FRAGMENTED NAME:
 * The Word was One, but the World is Many.
 * To find a vessel, we must know every step of the journey. 
 * This Atomizer takes the tangled string of the earth—
 * with its forward slashes and its backslashes—and dissolves it.
 */

/**
 * @class PathAtomizer
 * @description Logic for converting strings into strict path-segment arrays.
 */
export class PathAtomizer {
    /**
     * B"H - Transmutes a string into a Part Array.
     * @param {string} raw - The coordinate string.
     * @returns {string[]} Purified segments.
     */
    static atomize(raw) {
        if (!raw || typeof raw !== 'string') return [];

        // Split by both / and \
        const rawParts = raw.split(/[/\\]/);
        const atoms = [];

        for (let i = 0; i < rawParts.length; i++) {
            const part = rawParts[i].trim();
            
            if (!part || part === '.') continue;

            if (part === '..') {
                if (atoms.length > 0) {
                    atoms.pop();
                }
            } else {
                // Remove Windows drive colons (C:)
                const clean = part.replace(/:$/, '');
                atoms.push(clean);
            }
        }

        return atoms;
    }
}
