
// B"H
/**
 * @module Emerald
 * @description
 * 💎 CHAPTER 4: THE RADIANCE OF THE JEWEL 💎
 * 
 * "And the second row: an emerald..." (Shemos 28:18)
 * 
 * Unlike the organic, matte finish of grass, the emerald texture represents 
 * the crystallized clarity of Malchus. It uses a deep, vibrant palette with 
 * subtle crystalline facets to create a ground that feels like a precious stone.
 * 
 * @class Emerald
 */
import CanvasHelper from "../CanvasHelper.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class Emerald {
    /**
     * @static
     * @method generate
     * @description
     * Synthesizes a crystalline emerald texture.
     * 
     * @param {number} [width=256] - The horizontal extent of the vessel.
     * @param {number} [height=256] - The vertical extent of the vessel.
     * @returns {HTMLCanvasElement|OffscreenCanvas} The materialized canvas.
     */
    static generate(width = 256, height = 256) {
        try {
            const canvas = CanvasHelper.create(width, height);
            const ctx = canvas.getContext('2d');

            const imgData = ctx.createImageData(width, height);
            const data = imgData.data;

            // Emerald palette: Rich, deep greens with sharp, bright highlights
            const palette = [
                [0, 64, 32],    // Deep Shadow
                [0, 128, 64],   // Heart of the Gem
                [0, 164, 82],   // Emerald Glow
                [0, 200, 100],  // Inner Light
                [20, 255, 140], // Crystalline Spark
                [0, 100, 50]    // Solid Foundation
            ];

            let seed = 12345;
            const rand = () => {
                seed = (seed * 1664525 + 1013904223) & 0xffffffff;
                return (seed >>> 0) / 0xffffffff;
            };

            for (let i = 0; i < width * height; i++) {
                const x = i % width;
                const y = Math.floor(i / width);

                // Create a voronoi-like crystalline structure using the seed
                // For performance, we just use some per-pixel math
                const noise = rand();
                const colorIndex = Math.floor(noise * palette.length);
                const p = palette[colorIndex];
                
                // Subtle glisten based on position (pseudo-facets)
                const glisten = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 20;

                const idx = i * 4;
                data[idx]     = Math.max(0, Math.min(255, p[0] + glisten));
                data[idx + 1] = Math.max(0, Math.min(255, p[1] + glisten));
                data[idx + 2] = Math.max(0, Math.min(255, p[2] + glisten));
                data[idx + 3] = 255;
            }

            ctx.putImageData(imgData, 0, 0);
            return canvas;

        } catch (e) {
            console.error('B"H - 🚨 [Emerald]: The crystallization was interrupted:', e);
            const emergency = CanvasHelper.create(64, 64);
            const eCtx = emergency.getContext('2d');
            eCtx.fillStyle = '#008040';
            eCtx.fillRect(0, 0, 64, 64);
            return emergency;
        }
    }
}
