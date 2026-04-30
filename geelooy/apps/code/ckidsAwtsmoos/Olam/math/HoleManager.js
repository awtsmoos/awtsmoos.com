
// B"H
/**
 * @module HoleManager
 * @description
 * * Chapter 18: The Mastery of the Void
 * "He creates the darkness and forms the light."
 * This manager allows for the dynamic subtraction of matter.
 * It injects shader logic into materials to 'discard' pixels that fall within
 * specified spheres of nothingness.
 * * TIKKUN: To satisfy the compiler (Gevurah), the loop is now strictly 
 * bounded by a constant (MAX_HOLES), preventing the unrolling warning.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { SHADER_LIMITS, generateUnrollableLoop } from './boyrayNivra/ShaderLimiter.js';

export default class HoleManager {
    static holes = [];
    static _centers = new Float32Array(SHADER_LIMITS.MAX_HOLES * 3);
    static _radii = new Float32Array(SHADER_LIMITS.MAX_HOLES);

    /**
     * @method injectHoleLogic
     * @description Infuses a material with the capacity to witness and respect the Void.
     * @param {THREE.Material} material 
     */
    static injectHoleLogic(material) {
        if (!material) return;
        
        const originalOnBefore = material.onBeforeCompile;

        material.onBeforeCompile = (shader) => {
            // 1. Supply the divine parameters
            shader.uniforms.holeCenters = { value: this._centers };
            shader.uniforms.holeRadii = { value: this._radii };
            shader.uniforms.numHoles = { value: this.holes.length };

            // 2. Vertex Phase: Capture world position
            shader.vertexShader = `varying vec3 vAwtsmoosHoleWorldPos;\n` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <worldpos_vertex>',
                `#include <worldpos_vertex>\nvAwtsmoosHoleWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
            );

            // 3. Fragment Phase: The Act of Erasure
            const discardBody = `
                if (distance(vAwtsmoosHoleWorldPos, holeCenters[i]) < holeRadii[i]) {
                    discard;
                }
            `;
            const unrollableLoop = generateUnrollableLoop('numHoles', discardBody, SHADER_LIMITS.MAX_HOLES);

            shader.fragmentShader = `
                uniform vec3 holeCenters[${SHADER_LIMITS.MAX_HOLES}];
                uniform float holeRadii[${SHADER_LIMITS.MAX_HOLES}];
                uniform int numHoles;
                varying vec3 vAwtsmoosHoleWorldPos;
            ` + shader.fragmentShader;

            shader.fragmentShader = shader.fragmentShader.replace(
                'void main() {',
                `void main() {\n${unrollableLoop}`
            );

            if (originalOnBefore) originalOnBefore(shader);
        };
    }

    /**
     * @method addHole
     * @description Decrees a new sphere of non-existence at the coordinate.
     */
    static addHole(position, radius) {
        if (this.holes.length < SHADER_LIMITS.MAX_HOLES) {
            const idx = this.holes.length;
            this.holes.push({ position, radius });
            this._centers[idx * 3] = position.x;
            this._centers[idx * 3 + 1] = position.y;
            this._centers[idx * 3 + 2] = position.z;
            this._radii[idx] = radius;
            console.log(`B"H - 🕳️ New Hole #${idx} manifested at ${position.x}, ${position.y}, ${position.z}`);
        }
    }
}
