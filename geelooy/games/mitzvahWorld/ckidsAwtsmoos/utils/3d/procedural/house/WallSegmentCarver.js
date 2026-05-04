// B"H
/**
 * @module WallSegmentCarver
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE CHISEL OF LIGHT — Carving Doorways from Solid Wall   ║
 * ║                                                             ║
 * ║  Chapter 14: The Surgeon's Precision                        ║
 * ║                                                             ║
 * ║  A solid wall is like the uncarved Torah scroll — pure      ║
 * ║  potential. The chisel (this module) carves the sacred       ║
 * ║  openings: entrances through which souls may pass.          ║
 * ║                                                             ║
 * ║  For each hole, three segments are emitted:                 ║
 * ║    1. Solid section BEFORE the hole                          ║
 * ║    2. Lintel ABOVE the hole                                  ║
 * ║    3. Solid section AFTER the last hole                      ║
 * ║                                                             ║
 * ║  PURE DATA — zero THREE.js. Only JSON instructions.         ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

export default class WallSegmentCarver {
    /**
     * @method carve
     * @description
     * Given a wall's dimensions and holes, emits box instructions
     * for the solid portions and lintels.
     * 
     * @param {Object} opts
     * @param {number} opts.wallWidth - Total width of the wall
     * @param {number} opts.wallHeight - Total height of the wall
     * @param {number} opts.thickness - Wall depth/thickness
     * @param {Array} opts.holes - Array of { offset, width, height }
     * @param {number} opts.rotY - Y-axis rotation for final positioning
     * @param {Object} opts.pos - { x, y, z } translation after rotation
     * @param {Array} opts.out - Output instruction array (mutated)
     */
    static carve({ wallWidth, wallHeight, thickness, holes, rotY, pos, out }) {
        let currentX = 0;
        const sorted = [...holes].sort((a, b) => (a.offset || 0) - (b.offset || 0));

        sorted.forEach(hole => {
            const hW = hole.width || 4;
            const hH = hole.height || 5.5; 
            const sideMercy = 0.6; // B"H: Extra width for the trim pillars
            const totalHoleW = hW + sideMercy * 2;

            const holeStartX = (wallWidth / 2) + (hole.offset || 0) - (totalHoleW / 2);
            const holeEndX = holeStartX + totalHoleW;

            // Solid section BEFORE the hole
            if (holeStartX > currentX) {
                const segW = holeStartX - currentX;
                out.push(
                    WallSegmentCarver._makeSegment(
                        segW, wallHeight, thickness,
                        currentX + segW / 2 - wallWidth / 2,
                        wallHeight / 2,
                        rotY, pos
                    )
                );
            }

            // Lintel ABOVE the hole
            const floorOffset = 0.5; 
            const mercy = 0.7; // B"H: Space for the 0.6 trim beam + 0.1 gap
            const lintelH = wallHeight - (hH + floorOffset + mercy);
            if (lintelH > 0) {
                out.push(
                    WallSegmentCarver._makeSegment(
                        totalHoleW, lintelH, thickness,
                        holeStartX + totalHoleW / 2 - wallWidth / 2,
                        wallHeight - lintelH / 2,
                        rotY, pos
                    )
                );
            }

            currentX = holeEndX;
        });

        // Solid section AFTER the last hole (the remnant)
        if (currentX < wallWidth) {
            const segW = wallWidth - currentX;
            out.push(
                WallSegmentCarver._makeSegment(
                    segW, wallHeight, thickness,
                    currentX + segW / 2 - wallWidth / 2,
                    wallHeight / 2,
                    rotY, pos
                )
            );
        }
    }

    /**
     * @method _makeSegment
     * @description
     * Creates a single wall segment instruction with proper
     * modifier chain: local translate → rotate → world translate.
     * 
     * @param {number} w - Segment width
     * @param {number} h - Segment height
     * @param {number} depth - Wall thickness
     * @param {number} localX - X offset in wall-local space
     * @param {number} localY - Y offset in wall-local space
     * @param {number} rotY - Y rotation for face orientation
     * @param {Object} pos - { x, y, z } world position offset
     * @returns {Object} - Data instruction for BlueprintCompiler
     */
    static _makeSegment(w, h, depth, localX, localY, rotY, pos) {
        const mods = [
            { type: 'translate', x: localX, y: localY, z: 0 }
        ];
        if (rotY) {
            mods.push({ type: 'rotateY', angle: rotY });
        }
        mods.push({ type: 'translate', ...pos });

        return {
            type: 'box',
            params: { width: w, height: h, depth },
            modifiers: mods,
            materialGroup: 0
        };
    }
}
