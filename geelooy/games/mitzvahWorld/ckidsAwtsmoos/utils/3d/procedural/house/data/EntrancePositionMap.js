// B"H
/**
 * @module EntrancePositionMap
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE GATES OF THE FOUR DIRECTIONS — Door Position Data    ║
 * ║                                                             ║
 * ║  "And they made the gate of the court facing east"          ║
 * ║  (Shemos 27:14)                                             ║
 * ║                                                             ║
 * ║  This map provides the hinge position and rotation          ║
 * ║  for doors on each wall face. The Awtsmoos decreed          ║
 * ║  that every threshold must be positioned precisely —        ║
 * ║  not floating in the void, not buried in earth.             ║
 * ╚═══════════════════════════════════════════════════════════╝
 *
 * Each function returns { hx, hy, hz, rotY } — local offsets for
 * the door hinge point on the given wall, relative to building center.
 */

/**
 * @constant ENTRANCE_POSITIONS
 * @description
 * Pure data map: wall name → hinge position calculator.
 * 
 * @param {Object} ent - Entrance data { wall, offset, width, height }
 * @param {Object} bp  - Blueprint data { width, depth, wallThickness }
 * @returns {{ hx: number, hy: number, hz: number, rotY: number }}
 */
const ENTRANCE_POSITIONS = {
    /**
     * Front wall at +Z. Enterer walks -Z, their right = +X.
     * Hinge at inner face of the wall.
     */
    front: (ent, bp) => ({
        hx: (ent.offset || 0) + (ent.width / 2),
        hy: 0.5,
        hz: bp.depth / 2 - bp.wallThickness,
        rotY: 0
    }),

    /**
     * Back wall at -Z. Enterer walks +Z, their right = -X.
     */
    back: (ent, bp) => ({
        hx: -(ent.offset || 0) - (ent.width / 2),
        hy: 0.5,
        hz: -bp.depth / 2 + bp.wallThickness,
        rotY: Math.PI
    }),

    /**
     * Left wall at -X. Enterer walks +X, their right = -Z.
     */
    left: (ent, bp) => ({
        hx: -bp.width / 2 + bp.wallThickness,
        hy: 0.5,
        hz: -(ent.offset || 0) - (ent.width / 2),
        rotY: -Math.PI / 2
    }),

    /**
     * Right wall at +X. Enterer walks -X, their right = +Z.
     */
    right: (ent, bp) => ({
        hx: bp.width / 2 - bp.wallThickness,
        hy: 0.5,
        hz: (ent.offset || 0) + (ent.width / 2),
        rotY: Math.PI / 2
    })
};

export default ENTRANCE_POSITIONS;
