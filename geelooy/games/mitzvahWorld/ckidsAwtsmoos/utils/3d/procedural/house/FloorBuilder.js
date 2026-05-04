// B"H
/**
 * @module FloorBuilder
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE FOUNDATION OF THE EARTH — Floor Generation            ║
 * ║                                                             ║
 * ║  "He established the earth upon its foundations,            ║
 * ║  that it should not totter forever and ever."               ║
 * ║  (Tehillim 104:5)                                           ║
 * ║                                                             ║
 * ║  Generates a grand interior floor and deep foundation       ║
 * ║  beams that plunge into the earth, supporting the house     ║
 * ║  on uneven slopes. Now supports tiled mosaic patterns!      ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * PURE DATA builder — emits JSON instructions.
 */
export default class FloorBuilder {
    static build(blueprint) {
        const w = blueprint.width;
        const d = blueprint.depth;
        const t = blueprint.wallThickness || 1;
        
        // Floor dimensions: inset within the walls
        const innerW = w - t * 2;
        const innerD = d - t * 2;
        
        const floorThickness = 0.5;
        const foundationDepth = 15;
        const totalHeight = foundationDepth + floorThickness;

        const instructions = [];

        // 1. Foundation Block (Deep underground support)
        instructions.push({
            type: 'box',
            params: { width: innerW, height: foundationDepth, depth: innerD },
            modifiers: [
                { type: 'translate', x: 0, y: -foundationDepth / 2, z: 0 }
            ],
            materialGroup: 2 // Solid foundation material
        });

        // 2. The Main Floor Slab (Now Shader-Based Tiling!)
        instructions.push({
            type: 'box',
            params: { width: innerW, height: floorThickness, depth: innerD },
            modifiers: [
                { type: 'translate', x: 0, y: floorThickness/2, z: 0 }
            ],
            materialGroup: 3 // B"H: Mapped to AwtsmoosFloorMaterial (Shader-based tiles)
        });

        // 3. Threshold Slabs (Doormats) — Filling the gap at the entrances
        const entrances = blueprint.entrances || [];
        entrances.forEach(ent => {
            const eW = ent.width || 4;
            const doorThickness = t; 
            
            // Map wall name to position
            let tx = 0, tz = 0;
            if (ent.wall === 'front') {
                tx = ent.offset || 0;
                tz = d / 2 - t / 2;
            } else if (ent.wall === 'back') {
                tx = -(ent.offset || 0);
                tz = -d / 2 + t / 2;
            } else if (ent.wall === 'left') {
                tx = -w / 2 + t / 2;
                tz = -(ent.offset || 0);
            } else if (ent.wall === 'right') {
                tx = w / 2 - t / 2;
                tz = ent.offset || 0;
            }

            instructions.push({
                type: 'box',
                params: { 
                    width: (ent.wall === 'left' || ent.wall === 'right') ? t : eW, 
                    height: floorThickness, 
                    depth: (ent.wall === 'left' || ent.wall === 'right') ? eW : t 
                },
                modifiers: [
                    { type: 'translate', x: tx, y: floorThickness / 2, z: tz }
                ],
                materialGroup: 2 // Match floor material
            });
        });

        // 4. Corner Support Pillars (The Four Corners of the Earth)
        const beamW = 1.6;
        const beamH = foundationDepth + 2; // Extends slightly above ground
        const corners = [
            { x:  w/2 - t - beamW/2, z:  d/2 - t - beamW/2 },
            { x: -w/2 + t + beamW/2, z:  d/2 - t - beamW/2 },
            { x:  w/2 - t - beamW/2, z: -d/2 + t + beamW/2 },
            { x: -w/2 + t + beamW/2, z: -d/2 + t + beamW/2 }
        ];

        corners.forEach(c => {
            instructions.push({
                type: 'box',
                params: { width: beamW, height: beamH, depth: beamW },
                modifiers: [
                    { type: 'translate', x: c.x, y: -beamH / 2 + 1, z: c.z }
                ],
                materialGroup: 1 // Wood/Trim material for corner posts
            });
        });

        return instructions;
    }
}
