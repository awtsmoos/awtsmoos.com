
/**
 * B"H
 * @module DoorGeometry
 * @description
 * "Knock, and it shall be opened unto you."
 * Forges an elegant door, complete with a gleaming knob.
 * 
 * THE TIKKUN OF THE HINGE:
 * We translate the slab to -width/2. Since the hinge is placed at the right 
 * edge of the doorway opening by the EntrancePositionMap, extending negatively 
 * covers the gap perfectly and swings exactly as intended!
 */
import BlueprintCompiler from "./house/BlueprintCompiler.js";

export default class DoorGeometry {
    /**
     * @function generate
     * @param {number} width - Span of the opening
     * @param {number} height - Elevation of the doorway
     * @param {number} thickness - Physical depth of the wood
     */
    static generate(width = 4, height = 5.5, thickness = 0.5) {
        try {
            const instructions = [];

            // 1. The Main Slab (Wood)
            instructions.push({
                type: 'box',
                params: { width, height, depth: thickness },
                modifiers: [
                    { type: 'translate', x: -width / 2, y: height / 2, z: 0 }
                ],
                materialGroup: 0
            });

            // 2. Decorative Panels (Recessed)
            const panelMargin = 0.4;
            const panelDepth = thickness * 0.4;
            const pW = width - panelMargin * 2;
            const pH = (height / 2) - panelMargin * 1.5;
            
            // Top Panel
            instructions.push({
                type: 'box',
                params: { width: pW, height: pH, depth: panelDepth },
                modifiers: [
                    { type: 'translate', x: -width / 2, y: height * 0.75, z: thickness / 2 - panelDepth / 4 }
                ],
                materialGroup: 0
            });
            // Bottom Panel
            instructions.push({
                type: 'box',
                params: { width: pW, height: pH, depth: panelDepth },
                modifiers: [
                    { type: 'translate', x: -width / 2, y: height * 0.25, z: thickness / 2 - panelDepth / 4 }
                ],
                materialGroup: 0
            });

            // 3. The Doorknob (Gold/Metal)
            const knobRadius = 0.22;
            // Knob is on the OPPOSITE side of the hinge (X is negative)
            const knobX = -width + 0.6;
            const knobY = height * 0.45;
            const knobZ = (thickness / 2) + (knobRadius * 0.6);

            instructions.push({
                type: 'sphere',
                params: { radius: knobRadius, wSegs: 16, hSegs: 16 },
                modifiers: [
                    { type: 'translate', x: knobX, y: knobY, z: knobZ }
                ],
                materialGroup: 1
            });

            return BlueprintCompiler.compile(instructions);
        } catch (e) {
            console.error("B\"H - ⚡ Door Forge failed.", e);
            return BlueprintCompiler.compile([{
                type: 'box',
                params: { width, height, depth: thickness },
                modifiers: [
                    { type: 'translate', x: -width / 2, y: height / 2, z: 0 }
                ],
                materialGroup: 0
            }]);
        }
    }
}
