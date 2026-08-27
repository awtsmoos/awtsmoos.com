
// B"H
/**
 * @file BoundaryGuard.js
 * @brief THE SENTINEL OF THE CONFINED GARDEN.
 * 
 * THE POEM OF THE TZIMTZUM:
 * We build a wall to guard the holy way.
 * No path may exit, no coordinate roam.
 */

/**
 * @class BoundaryGuard
 * @description Enforces directory boundaries using array comparison.
 */
export class BoundaryGuard {
    /**
     * B"H - Ensures target atoms are a descendant of root atoms.
     */
    static enforce(rootAtoms, targetAtoms) {
        if (targetAtoms.length < rootAtoms.length) {
            console.warn('[BoundaryGuard] B"H - ESCAPE ATTEMPT: Path too shallow.');
            return rootAtoms;
        }

        for (let i = 0; i < rootAtoms.length; i++) {
            if (rootAtoms[i].toLowerCase() !== targetAtoms[i].toLowerCase()) {
                console.warn('[BoundaryGuard] B"H - BOUNDARY BREACH: Mismatch at segment ' + i);
                return rootAtoms;
            }
        }

        return targetAtoms;
    }
}
