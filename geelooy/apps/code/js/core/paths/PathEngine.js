
// B"H
/**
 * @file PathEngine.js
 * @brief THE UNIFIED CONDUIT OF SPATIAL LOGIC.
 * 
 * POEM OF THE MEASURED BOUNDARY:
 * The infinite is contracted to create a space,
 * Every coordinate assigned its proper place.
 * No path may wander, no logic may stray,
 * Beyond the limits of the Master's assigned way.
 */

import { PathNormalizer } from './atoms/PathNormalizer.js';
import { BoundaryGuard } from './atoms/BoundaryGuard.js';

export const PathEngine = {
    /**
     * B"H - Safely resolves and jails a requested path.
     * ENSURES that even if the AI asks for "/", it is grounded to the session root.
     * 
     * @param {string} sessionRootStr - The absolute project folder (e.g., /c/tests/ball).
     * @param {string} aiRequestStr - The AI's requested path (e.g., '/', '/src/main.js').
     * @returns {string} The final, safe, physical path string.
     */
    jailbreakSafeResolve(sessionRootStr, aiRequestStr) {
        // 1. Atomize the physical anchor (The Garden Floor)
        const rootAtoms = PathNormalizer.atomize(sessionRootStr);
        
        // 2. Atomize the AI's intent
        const reqAtoms = PathNormalizer.atomize(aiRequestStr);

        // 3. THE GRAND RECTIFICATION:
        // No matter what the AI says, we ALWAYS treat its request as relative 
        // to the Session Root. If it says "/", it gets the Session Root.
        // By concatenating them, we force the AI's path to be a child of the root.
        const mappedAtoms = rootAtoms.concat(reqAtoms);

        // 4. APPLY THE WALL (The Tzimtzum)
        // Ensure the resulting path hasn't escaped via excessive "../" commands.
        const safeAtoms = BoundaryGuard.enforce(rootAtoms, mappedAtoms);

        // 5. Manifest the absolute internal path
        return '/' + safeAtoms.join('/');
    },

    /**
     * B"H - Simple string normalization.
     */
    toSafeString(input) {
        const atoms = PathNormalizer.atomize(input);
        return '/' + atoms.join('/');
    },

    /**
     * B"H - Array atomization.
     */
    toArray(input) {
        return PathNormalizer.atomize(input);
    }
};
