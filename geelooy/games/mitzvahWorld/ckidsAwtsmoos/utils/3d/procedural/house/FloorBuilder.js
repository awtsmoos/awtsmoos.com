// B"H
/**
 * @module FloorBuilder
 * @description
 * PURE DATA builder — emits JSON instructions, zero THREE.js references.
 * 
 * Generates an interior floor that sits INSIDE the walls (inset by wallThickness)
 * so it doesn't z-fight with wall geometry. Also generates deep foundation
 * beams at each corner for slope support.
 */
export default class FloorBuilder {
    static build(blueprint) {
        const w = blueprint.width;
        const d = blueprint.depth;
        const t = blueprint.wallThickness || 1;
        
        // Floor dimensions: inset within the walls
        const innerW = w - t * 2;
        const innerD = d - t * 2;
        
        const floorThickness = 0.3;
        const foundationDepth = 12;
        const totalHeight = foundationDepth + floorThickness;

        const instructions = [];

        // Interior floor slab (inset within walls, materialGroup 2 for custom floor material)
        instructions.push({
            type: 'box',
            params: { width: innerW, height: totalHeight, depth: innerD },
            modifiers: [
                { type: 'translate', x: 0, y: floorThickness - totalHeight / 2, z: 0 }
            ],
            materialGroup: 2
        });

        // Foundation support beams at corners (extend deep underground)
        const beamW = 1.2;
        const beamH = 18;
        const corners = [
            { x:  w/2 - beamW/2, z:  d/2 - beamW/2 },
            { x: -w/2 + beamW/2, z:  d/2 - beamW/2 },
            { x:  w/2 - beamW/2, z: -d/2 + beamW/2 },
            { x: -w/2 + beamW/2, z: -d/2 + beamW/2 }
        ];

        corners.forEach(c => {
            instructions.push({
                type: 'box',
                params: { width: beamW, height: beamH, depth: beamW },
                modifiers: [
                    { type: 'translate', x: c.x, y: -beamH / 2, z: c.z }
                ],
                materialGroup: 2
            });
        });

        return instructions;
    }
}
