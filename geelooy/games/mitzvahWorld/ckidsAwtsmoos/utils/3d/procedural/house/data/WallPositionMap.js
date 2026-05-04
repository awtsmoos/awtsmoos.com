// B"H
/**
 * @module WallPositionMap
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE COMPASS OF WALLS — Pure Data Positioning             ║
 * ║                                                             ║
 * ║  Each wall of the house is a face of the cosmic cube.       ║
 * ║  This map defines, for each named face, how to position     ║
 * ║  and rotate a wall segment in local blueprint space.        ║
 * ║                                                             ║
 * ║  "The world was created with ten utterances" — and each     ║
 * ║  wall is one utterance of the Awtsmoos, a boundary          ║
 * ║  between inner holiness and outer void.                     ║
 * ╚═══════════════════════════════════════════════════════════╝
 *
 * @type {Object<string, Function>}
 * 
 * Each entry returns:
 *   { wallWidth, rotY, pos: {x, y, z} }
 * given the blueprint's dimensions.
 */

/**
 * @constant WALL_FACES
 * @description
 * A pure data map: wall name → geometry parameters.
 * No logic, no THREE.js, just the Torah of wall positions.
 * 
 * @param {Object} bp - Blueprint with width, height, depth, wallThickness
 * @returns {{ wallWidth: number, rotY: number, pos: {x:number, y:number, z:number} }}
 */
const WALL_FACES = {
    front: (bp) => ({
        wallWidth: bp.width,
        rotY: 0,
        pos: { x: 0, y: 0, z: bp.depth / 2 - bp.wallThickness / 2 }
    }),

    back: (bp) => ({
        wallWidth: bp.width,
        rotY: Math.PI,
        pos: { x: 0, y: 0, z: -bp.depth / 2 + bp.wallThickness / 2 }
    }),

    left: (bp) => ({
        wallWidth: bp.depth - bp.wallThickness * 2,
        rotY: -Math.PI / 2,
        pos: { x: -bp.width / 2 + bp.wallThickness / 2, y: 0, z: 0 }
    }),

    right: (bp) => ({
        wallWidth: bp.depth - bp.wallThickness * 2,
        rotY: Math.PI / 2,
        pos: { x: bp.width / 2 - bp.wallThickness / 2, y: 0, z: 0 }
    })
};

export default WALL_FACES;
