
// B"H
/**
 * @file gerstner.js
 * @brief The Mathematical Womb of the Sea.
 * 
 * THE HYMN OF THE CIRCULAR PATH:
 * The water does not merely rise and fall like a curtain in the wind.
 * It moves in the holy circle, the orbital path of the deep.
 * As the Awtsmoos commands the wind to blow,
 * The vertices pull together at the summit,
 * creating the sharp crest, the crown of the wave.
 */

import { Vec3 } from '../../../../math/vec3.js';

/**
 * @class GerstnerWave
 * @brief Represents a single trochoidal wave component.
 */
export class GerstnerWave {
    /**
     * @param {object} params { direction: [x, z], steepness, wavelength }
     */
    constructor(params) {
        this.dir = Vec3.normalize([params.direction[0], 0, params.direction[1]]);
        this.steepness = params.steepness || 0.5;
        this.wavelength = params.wavelength || 50.0;
        
        // k = 2pi / wavelength
        this.k = (2.0 * Math.PI) / this.wavelength;
        // c = sqrt(g / k) - phase speed
        this.c = Math.sqrt(9.8 / this.k);
        // a = steepness / k
        this.a = this.steepness / this.k;
    }

    /**
     * B"H - Calculates the 3D displacement for a point at time t.
     * @returns {Array} [dx, dy, dz]
     */
    getDisplacement(p, t) {
        const f = this.k * (Vec3.dot(this.dir, p) - this.c * t);
        const cosF = Math.cos(f);
        const sinF = Math.sin(f);

        return [
            this.dir[0] * (this.a * cosF),
            this.a * sinF,
            this.dir[2] * (this.a * cosF)
        ];
    }

    /**
     * B"H - Calculates the Normal contribution of this wave.
     */
    getNormalContribution(p, t) {
        const f = this.k * (Vec3.dot(this.dir, p) - this.c * t);
        const cosF = Math.cos(f);
        const sinF = Math.sin(f);

        const wa = this.k * this.a;
        return [
            -(this.dir[0] * wa * cosF),
            -(wa * sinF), // Simplified partial derivative accumulation
            -(this.dir[2] * wa * cosF)
        ];
    }
}
