// B"H
/**
 * @module WallBuilder
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE WALLS OF THE SANCTUARY — Pure Data Emission          ║
 * ║                                                             ║
 * ║  Chapter 13: The Four Walls of Creation                     ║
 * ║                                                             ║
 * ║  "And Solomon overlaid the house within with pure gold"     ║
 * ║  (Melachim I 6:21)                                          ║
 * ║                                                             ║
 * ║  Each wall is carved from a single rectangular slab.        ║
 * ║  Where entrances are decreed, the slab is split into        ║
 * ║  solid sections and lintels above doorways.                 ║
 * ║                                                             ║
 * ║  PURE DATA — zero THREE.js references. Only JSON emitted.  ║
 * ║  Delegates wall positioning to WallPositionMap.             ║
 * ╚═══════════════════════════════════════════════════════════╝
 */
import WALL_FACES from './data/WallPositionMap.js';
import WallSegmentCarver from './WallSegmentCarver.js';

export default class WallBuilder {
    /**
     * @method build
     * @description
     * Iterates over all four wall faces, carving holes for entrances.
     * 
     * @param {Object} blueprint - { width, height, depth, wallThickness, entrances }
     * @returns {Array<Object>} Array of data instructions for BlueprintCompiler
     */
    static build(blueprint) {
        const entrances = blueprint.entrances || [];
        const instructions = [];
        const faceNames = Object.keys(WALL_FACES);

        faceNames.forEach(faceName => {
            const faceData = WALL_FACES[faceName](blueprint);
            const holes = entrances.filter(e => e.wall === faceName);

            WallSegmentCarver.carve({
                wallWidth: faceData.wallWidth,
                wallHeight: blueprint.height,
                thickness: blueprint.wallThickness,
                holes,
                rotY: faceData.rotY,
                pos: faceData.pos,
                out: instructions
            });
        });

        return instructions;
    }
}
