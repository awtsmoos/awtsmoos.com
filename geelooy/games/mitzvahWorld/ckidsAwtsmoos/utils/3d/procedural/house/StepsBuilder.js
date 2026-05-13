// B"H
/**
 * @module StepsBuilder
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE STAIRWAY OF ASCENT — Pure Data Step Generator        ║
 * ║                                                             ║
 * ║  Chapter 16: The Ladder of Yaakov                           ║
 * ║                                                             ║
 * ║  "And he dreamed, and behold a ladder set upon the earth,  ║
 * ║  and the top of it reached to heaven" (Bereishis 28:12)    ║
 * ║                                                             ║
 * ║  Steps cascade from the entrance outward and downward,     ║
 * ║  each slightly wider than the last (flaring), creating     ║
 * ║  a grand staircase approach.                                ║
 * ║                                                             ║
 * ║  Includes a support skirt underneath to prevent floating   ║
 * ║  steps on sloped terrain.                                   ║
 * ║                                                             ║
 * ║  PURE DATA — zero THREE.js. Only JSON instructions.        ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

/**
 * @constant STEP_CONFIG
 * @description
 * Sacred proportions for step generation.
 * Like the precise measurements of the Temple's stairs.
 */
const STEP_CONFIG = {
    depth: 1.2,
    height: 0.4,
    count: 8,       // More steps to handle steep slopes
    flare: 0.4,
    skirtDepth: 12  // Deeper support to avoid floating
};

/**
 * @constant STEP_DIRECTION_MAP
 * @description
 * Maps wall name → step offset calculator.
 * Each returns { dx, dz } for the i-th step,
 * and { sx, sz } for the support skirt.
 * 
 * @type {Object<string, Function>}
 */
const STEP_DIRECTION_MAP = {
    front: (bp, ent, i, stepDepth) => ({
        dx: ent.offset || 0,
        dz: bp.depth / 2 + (i * stepDepth) + stepDepth / 2
    }),
    back: (bp, ent, i, stepDepth) => ({
        dx: -(ent.offset || 0),
        dz: -bp.depth / 2 - (i * stepDepth) - stepDepth / 2
    }),
    left: (bp, ent, i, stepDepth) => ({
        dx: -bp.width / 2 - (i * stepDepth) - stepDepth / 2,
        dz: -(ent.offset || 0)
    }),
    right: (bp, ent, i, stepDepth) => ({
        dx: bp.width / 2 + (i * stepDepth) + stepDepth / 2,
        dz: ent.offset || 0
    })
};

/**
 * @constant SKIRT_DIRECTION_MAP
 * @description Support skirt position for each wall direction.
 */
const SKIRT_DIRECTION_MAP = {
    front: (bp, ent, totalRun) => ({
        sx: ent.offset || 0,
        sz: bp.depth / 2 + totalRun / 2
    }),
    back: (bp, ent, totalRun) => ({
        sx: -(ent.offset || 0),
        sz: -bp.depth / 2 - totalRun / 2
    }),
    left: (bp, ent, totalRun) => ({
        sx: -bp.width / 2 - totalRun / 2,
        sz: -(ent.offset || 0)
    }),
    right: (bp, ent, totalRun) => ({
        sx: bp.width / 2 + totalRun / 2,
        sz: ent.offset || 0
    })
};

export default class StepsBuilder {
    /**
     * @method build
     * @description
     * Generates step instructions for all entrances in the blueprint.
     * 
     * @param {Object} blueprint
     * @returns {Array<Object>} Data instructions
     */
    static build(blueprint) {
        const entrances = blueprint.entrances || [];
        const instructions = [];

        // B"H: The stairs belong to the earth!
        // Do not generate stairs or skirts for floating/upper floors.
        const isGrounded = !blueprint.offset || blueprint.offset[1] === 0;
        if (!isGrounded) return instructions;

        entrances.forEach(entrance => {
            StepsBuilder._buildStepsForEntrance(blueprint, entrance, instructions);
            StepsBuilder._buildSupportSkirt(blueprint, entrance, instructions);
        });

        return instructions;
    }

    /**
     * @method _buildStepsForEntrance
     * @description
     * Emits step instructions for a single entrance.
     */
    static _buildStepsForEntrance(bp, entrance, out) {
        const w = entrance.width || 4;
        const dirFn = STEP_DIRECTION_MAP[entrance.wall];
        if (!dirFn) return;

        for (let i = 0; i < STEP_CONFIG.count; i++) {
            const currentWidth = w + (i * STEP_CONFIG.flare);
            const { dx, dz } = dirFn(bp, entrance, i, STEP_CONFIG.depth);
            const dy = -i * STEP_CONFIG.height;

            out.push({
                type: 'box',
                params: {
                    width: currentWidth,
                    height: STEP_CONFIG.height,
                    depth: STEP_CONFIG.depth
                },
                modifiers: [
                    { type: 'translate', x: dx, y: dy, z: dz }
                ],
                materialGroup: 0
            });
        }
    }

    /**
     * @method _buildSupportSkirt
     * @description
     * Emits a support slab underneath the stairs to prevent
     * them from floating on sloped terrain.
     */
    static _buildSupportSkirt(bp, entrance, out) {
        const w = entrance.width || 4;
        const totalRun = STEP_CONFIG.count * STEP_CONFIG.depth;
        const totalDrop = (STEP_CONFIG.count - 1) * STEP_CONFIG.height;
        const skirtW = w + (STEP_CONFIG.count * STEP_CONFIG.flare);

        const dirFn = SKIRT_DIRECTION_MAP[entrance.wall];
        if (!dirFn) return;

        const { sx, sz } = dirFn(bp, entrance, totalRun);

        out.push({
            type: 'box',
            params: {
                width: skirtW,
                height: STEP_CONFIG.skirtDepth,
                depth: totalRun
            },
            modifiers: [
                { type: 'translate', x: sx, y: -totalDrop - STEP_CONFIG.skirtDepth / 2, z: sz }
            ],
            materialGroup: 2
        });
    }
}
