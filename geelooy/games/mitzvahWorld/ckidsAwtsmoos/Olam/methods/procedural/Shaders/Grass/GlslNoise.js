
/**
 * B"H
 * @module GlslNoise
 * @description
 * Pure GLSL logic. Like the breath that vibrated across the void to produce the 
 * first vibrations of matter. This module provides the noise functions needed 
 * to sculpt the illusion of variety from a single uniform plane.
 */
export default class GlslNoise {
    /**
     * @function getHeader
     * @description Returns the string representation of noise functions.
     * @returns {string}
     */
    static getHeader() {
        return `
            // B"H: Sacred Noise Algorithms
            float awtsmoosHash(vec2 p) { 
                return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); 
            }
            
            float awtsmoosNoise(vec2 x) {
                vec2 i = floor(x);
                vec2 f = fract(x);
                float a = awtsmoosHash(i);
                float b = awtsmoosHash(i + vec2(1.0, 0.0));
                float c = awtsmoosHash(i + vec2(0.0, 1.0));
                float d = awtsmoosHash(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }

            float awtsmoosFbm(vec2 p) {
                float v = 0.0;
                v += awtsmoosNoise(p * 10.0) * 0.500;
                v += awtsmoosNoise(p * 20.0) * 0.250;
                v += awtsmoosNoise(p * 40.0) * 0.125;
                return v;
            }
        `;
    }
}
