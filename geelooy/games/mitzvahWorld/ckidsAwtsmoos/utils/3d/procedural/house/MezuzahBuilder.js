// B"H
/**
 * @module MezuzahBuilder
 * @description
 * PURE DATA builder — emits JSON instructions, zero THREE.js references.
 * 
 * Places a small tilted rectangle on the RIGHT-HAND doorpost
 * (right side of the one entering) at the top third of the entrance height.
 */
export default class MezuzahBuilder {
    static build(blueprint) {
        const t = blueprint.wallThickness || 1;
        const entrances = blueprint.entrances || [];
        const instructions = [];

        entrances.forEach(entrance => {
            const w = entrance.width || 4;
            const h = entrance.height || 6;

            // Mezuza dimensions
            const mW = 0.15;
            const mH = 0.6;
            const mD = 0.1;

            // Position: right doorpost, top third of entrance height
            // "Right" means the right side of someone walking IN
            let dx = 0, dz = 0;
            const dy = h - (h / 3);

            const mods = [];

            // Slight diagonal tilt (top leans inward toward door center)
            mods.push({ type: 'rotateZ', angle: 0.2 });

            if (entrance.wall === 'front') {
                // Entering = walking -Z. Right side of enterer = +X.
                dx = (entrance.offset || 0) + (w / 2) + mW/2;
                dz = blueprint.depth/2 - t/2; // On the inner face of the wall
            } else if (entrance.wall === 'back') {
                dx = -(entrance.offset || 0) - (w / 2) - mW/2;
                dz = -blueprint.depth/2 + t/2;
                mods.push({ type: 'rotateY', angle: Math.PI });
            } else if (entrance.wall === 'left') {
                dx = -blueprint.width/2 + t/2;
                dz = -(entrance.offset || 0) - (w / 2) - mW/2;
                mods.push({ type: 'rotateY', angle: -Math.PI/2 });
            } else if (entrance.wall === 'right') {
                dx = blueprint.width/2 - t/2;
                dz = (entrance.offset || 0) + (w / 2) + mW/2;
                mods.push({ type: 'rotateY', angle: Math.PI/2 });
            }

            mods.push({ type: 'translate', x: dx, y: dy, z: dz });

            instructions.push({
                type: 'box',
                params: { width: mW, height: mH, depth: mD },
                modifiers: mods,
                materialGroup: 1 // Wood material group
            });
        });

        return instructions;
    }
}
