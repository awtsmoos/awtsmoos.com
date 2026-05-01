// B"H
/**
 * @module WallBuilder
 * @description
 * PURE DATA builder — emits JSON instructions, zero THREE.js references.
 * Generates wall segments with carved doorway openings (lintel above, solid on sides).
 */
export default class WallBuilder {
    /**
     * @param {Object} blueprint - { width, height, depth, wallThickness, entrances }
     * @returns {Array} Array of data instructions for BlueprintCompiler
     */
    static build(blueprint) {
        const w = blueprint.width;
        const h = blueprint.height;
        const d = blueprint.depth;
        const t = blueprint.wallThickness;
        const entrances = blueprint.entrances || [];

        const getHoles = (wallName) => entrances.filter(e => e.wall === wallName);

        const instructions = [];

        // FRONT WALL (+Z face)
        this._carveWall(w, h, t, getHoles('front'), 0, { x: 0, y: 0, z: d/2 - t/2 }, instructions);

        // BACK WALL (-Z face, rotated 180°)
        this._carveWall(w, h, t, getHoles('back'), Math.PI, { x: 0, y: 0, z: -d/2 + t/2 }, instructions);

        // LEFT WALL (-X, carved to fit inside front/back pillars)
        this._carveWall(d - t*2, h, t, getHoles('left'), -Math.PI/2, { x: -w/2 + t/2, y: 0, z: 0 }, instructions);

        // RIGHT WALL (+X)
        this._carveWall(d - t*2, h, t, getHoles('right'), Math.PI/2, { x: w/2 - t/2, y: 0, z: 0 }, instructions);

        return instructions;
    }

    /**
     * Carve a single wall face with holes, emitting data instructions.
     * @param {number} wallWidth - total width of the wall segment
     * @param {number} wallHeight - wall height
     * @param {number} thickness - wall thickness
     * @param {Array} holes - array of { offset, width, height }
     * @param {number} rotY - Y rotation for positioning
     * @param {Object} pos - { x, y, z } translation after rotation
     * @param {Array} out - output instruction array
     */
    static _carveWall(wallWidth, wallHeight, thickness, holes, rotY, pos, out) {
        let currentX = 0;
        const sorted = [...holes].sort((a, b) => (a.offset || 0) - (b.offset || 0));

        sorted.forEach(hole => {
            const hW = hole.width || 4;
            const hH = hole.height || 5;
            const holeStartX = (wallWidth / 2) + (hole.offset || 0) - (hW / 2);
            const holeEndX = holeStartX + hW;

            // Solid section BEFORE the hole
            if (holeStartX > currentX) {
                const segW = holeStartX - currentX;
                const mods = [
                    { type: 'translate', x: currentX + segW/2 - wallWidth/2, y: wallHeight/2, z: 0 }
                ];
                if (rotY) mods.push({ type: 'rotateY', angle: rotY });
                mods.push({ type: 'translate', ...pos });

                out.push({
                    type: 'box',
                    params: { width: segW, height: wallHeight, depth: thickness },
                    modifiers: mods,
                    materialGroup: 0
                });
            }

            // LINTEL above the hole
            const lintelH = wallHeight - hH;
            if (lintelH > 0) {
                const mods = [
                    { type: 'translate', x: holeStartX + hW/2 - wallWidth/2, y: wallHeight - lintelH/2, z: 0 }
                ];
                if (rotY) mods.push({ type: 'rotateY', angle: rotY });
                mods.push({ type: 'translate', ...pos });

                out.push({
                    type: 'box',
                    params: { width: hW, height: lintelH, depth: thickness },
                    modifiers: mods,
                    materialGroup: 0
                });
            }

            currentX = holeEndX;
        });

        // Solid section AFTER the last hole
        if (currentX < wallWidth) {
            const segW = wallWidth - currentX;
            const mods = [
                { type: 'translate', x: currentX + segW/2 - wallWidth/2, y: wallHeight/2, z: 0 }
            ];
            if (rotY) mods.push({ type: 'rotateY', angle: rotY });
            mods.push({ type: 'translate', ...pos });

            out.push({
                type: 'box',
                params: { width: segW, height: wallHeight, depth: thickness },
                modifiers: mods,
                materialGroup: 0
            });
        }
    }
}
