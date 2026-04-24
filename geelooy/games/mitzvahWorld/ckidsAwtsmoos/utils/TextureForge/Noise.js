
/**
 * B"H
 * @module Noise
 * @description
 * Before the light was drawn down in a structured Kav (line), there was the Reshimu,
 * the chaotic residue of the Infinite. This Noise generator represents that primordial chaos,
 * the Tohu, from which all physical textures (bark, sand, leaf) are sculpted by the Divine Will.
 * 
 * "From the void, a pixel is born, a canvas of nothingness suddenly torn,
 * Mathematics and spirit in unison sing, forming the patterns of everything."
 */
export default class Noise {
    /**
     * @constructor
     * @param {number} seed - The divine seed, the starting point of creation.
     */
    constructor(seed = Math.random()) {
        this.seed = seed;
        this.p = new Uint8Array(512);
        this.permutation = new Uint8Array(256);
        this.init();
    }

    /**
     * @function init
     * @description Scrambles the alphabet of creation to generate infinite variety.
     */
    init() {
        for (let i = 0; i < 256; i++) {
            this.permutation[i] = Math.floor(Math.random() * 256);
        }
        for (let i = 0; i < 512; i++) {
            this.p[i] = this.permutation[i % 256];
        }
    }

    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(t, a, b) { return a + t * (b - a); }
    grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    /**
     * @function perlin2D
     * @description Generates 2D noise at the given coordinates. The breath of the Creator moving over the waters.
     * @param {number} x - The X coordinate in the fabric of space.
     * @param {number} y - The Y coordinate in the fabric of space.
     * @returns {number} A value between -1 and 1 representing the density of the light.
     */
    perlin2D(x, y) {
        let X = Math.floor(x) & 255;
        let Y = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        const u = this.fade(x);
        const v = this.fade(y);

        const A = this.p[X] + Y, B = this.p[X + 1] + Y;

        return this.lerp(v, 
            this.lerp(u, this.grad(this.p[A], x, y), this.grad(this.p[B], x - 1, y)),
            this.lerp(u, this.grad(this.p[A + 1], x, y - 1), this.grad(this.p[B + 1], x - 1, y - 1))
        );
    }

    /**
     * @function fractal
     * @description Layers of worlds, Seder Hishtalshelus. Combines multiple octaves of noise.
     */
    fractal(x, y, octaves = 4, persistence = 0.5, lacunarity = 2) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;

        for(let i = 0; i < octaves; i++) {
            total += this.perlin2D(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return total / maxValue;
    }
}
