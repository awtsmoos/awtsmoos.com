// B"H
/**
 * @module RoofBuilder
 * @description
 * PURE DATA builder — emits JSON instructions, zero THREE.js references.
 * Generates a 4-sided pyramid roof with overhang.
 */
export default class RoofBuilder {
    static build(blueprint) {
        const w = blueprint.width;
        const h = blueprint.height;
        const d = blueprint.depth;
        const roofHeight = Math.max(w, d) * 0.4;
        const overhang = 1.0;
        const circumRadius = (Math.max(w, d) / 2 + overhang) * Math.sqrt(2);

        return [{
            type: 'cone',
            params: { radius: circumRadius, height: roofHeight, segments: 4 },
            modifiers: [
                { type: 'rotateY', angle: Math.PI / 4 },
                { type: 'translate', x: 0, y: h + roofHeight / 2, z: 0 }
            ],
            materialGroup: 1
        }];
    }
}
