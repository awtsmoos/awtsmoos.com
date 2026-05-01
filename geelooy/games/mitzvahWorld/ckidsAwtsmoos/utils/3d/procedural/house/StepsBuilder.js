// B"H
/**
 * @module StepsBuilder
 * @description
 * PURE DATA builder — emits JSON instructions, zero THREE.js references.
 * 
 * Generates steps at each entrance that cascade down from the floor level.
 * Now includes a supporting RAMP/skirt underneath the steps so they aren't
 * floating in the air on slopes, plus a landing pad at the bottom.
 */
export default class StepsBuilder {
    static build(blueprint) {
        const t = blueprint.wallThickness || 1;
        const entrances = blueprint.entrances || [];
        const instructions = [];

        entrances.forEach(entrance => {
            const w = entrance.width || 4;
            const stepDepth = 1.2;
            const stepHeight = 0.4;
            const numSteps = 4;
            const flare = 0.4; // Each step gets slightly wider

            for (let i = 0; i < numSteps; i++) {
                const currentWidth = w + (i * flare);
                const mods = [];
                let dx = 0, dz = 0, dy = -i * stepHeight;

                // Position relative to wall
                if (entrance.wall === 'front') {
                    dz = blueprint.depth/2 + (i * stepDepth) + stepDepth/2;
                    dx = entrance.offset || 0;
                } else if (entrance.wall === 'back') {
                    dz = -blueprint.depth/2 - (i * stepDepth) - stepDepth/2;
                    dx = -(entrance.offset || 0);
                } else if (entrance.wall === 'left') {
                    dx = -blueprint.width/2 - (i * stepDepth) - stepDepth/2;
                    dz = -(entrance.offset || 0);
                } else if (entrance.wall === 'right') {
                    dx = blueprint.width/2 + (i * stepDepth) + stepDepth/2;
                    dz = entrance.offset || 0;
                }

                mods.push({ type: 'translate', x: dx, y: dy, z: dz });

                instructions.push({
                    type: 'box',
                    params: { width: currentWidth, height: stepHeight, depth: stepDepth },
                    modifiers: mods,
                    materialGroup: 0
                });
            }

            // Support skirt under the stairs (a single angled slab connecting
            // the wall base to the bottom step, preventing floating steps on slopes)
            const totalStepRun = numSteps * stepDepth;
            const totalDrop = (numSteps - 1) * stepHeight;
            const skirtHeight = 8; // extends deep underground
            const skirtW = w + (numSteps * flare);
            
            let sx = 0, sz = 0;
            if (entrance.wall === 'front') {
                sz = blueprint.depth/2 + totalStepRun/2;
                sx = entrance.offset || 0;
            } else if (entrance.wall === 'back') {
                sz = -blueprint.depth/2 - totalStepRun/2;
                sx = -(entrance.offset || 0);
            } else if (entrance.wall === 'left') {
                sx = -blueprint.width/2 - totalStepRun/2;
                sz = -(entrance.offset || 0);
            } else if (entrance.wall === 'right') {
                sx = blueprint.width/2 + totalStepRun/2;
                sz = entrance.offset || 0;
            }

            instructions.push({
                type: 'box',
                params: { width: skirtW, height: skirtHeight, depth: totalStepRun },
                modifiers: [
                    { type: 'translate', x: sx, y: -totalDrop - skirtHeight/2, z: sz }
                ],
                materialGroup: 2 // Foundation material — hidden underground
            });
        });

        return instructions;
    }
}
