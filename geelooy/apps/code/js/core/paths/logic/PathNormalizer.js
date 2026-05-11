
// B"H
/**
 * @file PathNormalizer.js
 * @brief THE SIEVE OF THE SIMPLE TRUTH.
 * 
 * THE POEM OF THE RECTIFIED STRING:
 * The user speaks in many tongues—some use the forward slash, 
 * some use the back. To the Awtsmoos, all are but vibrations 
 * of the same intent. 
 * 
 * This Normalizer is the Priest at the gate. It takes the 
 * tangled string and pulls it through the sieve. It splits 
 * the path by any separator, purges the whitespace chaff, 
 * and resolves the ".." and "."—the relative shadows of 
 * previous worlds—leaving only the pure Array of destinations.
 */

import { PathPartVessel } from '../vessels/PathPartVessel.js';

/**
 * @class PathNormalizer
 * @description Logic engine for atomizing and cleaning path strings.
 */
export class PathNormalizer {
    /**
     * B"H - Transmutes a raw string into a purified Part Vessel.
     * @param {string} rawInput 
     * @returns {PathPartVessel}
     */
    static normalize(rawInput) {
        if (!rawInput || typeof rawInput !== 'string') {
            return new PathPartVessel([], false);
        }

        // 1. DETECTION OF ANCHOR
        // Does it start with a slash or a Windows drive?
        const isAbsolute = rawInput.startsWith('/') || rawInput.startsWith('\\') || /^[a-zA-Z]:/.test(rawInput);

        // 2. THE RITUAL OF SPLITTING
        // We split by both forward and back slashes simultaneously.
        const rawParts = rawInput.split(/[/\\]/);
        
        // 3. THE PURGATION
        // Filter out empty segments and current-directory dots.
        const filtered = [];
        for (let i = 0; i < rawParts.length; i++) {
            const part = rawParts[i].trim();
            if (!part || part === '.') continue;

            if (part === '..') {
                // ASCENSION: If we see double dots, we go back one step.
                if (filtered.length > 0) {
                    filtered.pop();
                }
            } else {
                // INHERITANCE: Standard name segments are kept.
                filtered.push(part);
            }
        }

        return new PathPartVessel(filtered, isAbsolute);
    }
}
