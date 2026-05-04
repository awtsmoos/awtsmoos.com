
// B"H
/**
 * @module HoleManager
 * @description
 * * Chapter 18: The Sacred Subtraction
 * This manager allows the world to have 'holes' (voids) where the light 
 * is discarded based on proximity to spherical coordinates.
 * * TIKKUN: Integrated with ShaderLimiter to ensure the loop is 
 * compile-time stable and satisfies the DirectX/OpenGL unrolling decrees.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { SHADER_LIMITS, generateUnrollableLoop } from './boyrayNivra/ShaderLimiter.js';

export default class HoleManager {
    static holes = [];
    static _centers = new Float32Array(SHADER_LIMITS.MAX_HOLES * 3);
    static _radii = new Float32Array(SHADER_LIMITS.MAX_HOLES);

    /**
     * @method injectHoleLogic
     * @description Binds the act of pixel erasure to a material's shader.
     */
    static injectHoleLogic(material) {
        if (!material) return;
        
        const originalOnBefore = material.onBeforeCompile;

        material.onBeforeCompile = (shader) => {
            // 1. Supply the uniform data
            shader.uniforms.holeCenters = { value: this._centers };
            shader.uniforms.holeRadii = { value: this._radii };
            shader.uniforms.numHoles = { value: this.holes.length };

            // 2. Vertex: Capture absolute coordinates
            shader.vertexShader = `varying vec3 vAwtsmoosHoleWorldPos;\n` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <worldpos_vertex>',
                `#include <worldpos_vertex>\nvAwtsmoosHoleWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
            );

            // 3. Fragment: Perform the Tzimtzum (Constriction)
            const loopBody = `
                if (distance(vAwtsmoosHoleWorldPos, holeCenters[i]) < holeRadii[i]) {
                    discard;
                }
            `;
            const boundedLoop = generateUnrollableLoop('numHoles', loopBody, SHADER_LIMITS.MAX_HOLES);

            shader.fragmentShader = `
                uniform vec3 holeCenters[${SHADER_LIMITS.MAX_HOLES}];
                uniform float holeRadii[${SHADER_LIMITS.MAX_HOLES}];
                uniform int numHoles;
                varying vec3 vAwtsmoosHoleWorldPos;
            ` + shader.fragmentShader;

            shader.fragmentShader = shader.fragmentShader.replace(
                'void main() {',
                `void main() {\n${boundedLoop}`
            );

            if (originalOnBefore) originalOnBefore(shader);
        };
    }

    /**
     * @method addHole
     * @description Places a new center of non-existence in the world.
     */
    static addHole(position, radius) {
        if (this.holes.length < SHADER_LIMITS.MAX_HOLES) {
            const idx = this.holes.length;
            this.holes.push({ position, radius });
            this._centers[idx * 3] = position.x;
            this._centers[idx * 3 + 1] = position.y;
            this._centers[idx * 3 + 2] = position.z;
            this._radii[idx] = radius;
            // B"H: silent

        }
    }
}
