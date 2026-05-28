
// B"H
/**
 * @module SafeGrass
 * @description
 * 🌿 CHAPTER 3: THE BREATH OF THE COLOR 🌿
 * 
 * "Let the earth put forth grass, herb-yielding seed..." (Bereishis 1:11)
 * 
 * Just as the speech of the Creator constanty refreshes every blade of 
 * organic grass, we refresh the pixels of our digital field. 
 * This module bypasses the heavy, repetitive 'fillRect' commands which 
 * were causing the Worker to stutter and freeze during the Tzimtzum. 
 * Instead, we write directly to the 'ImageData' buffer—the absolute 
 * atomic layer of the canvas—and manifest the entire emerald plane 
 * in a single, unified burst of light.
 * 
 * @class SafeGrass
 */
import CanvasHelper from "../CanvasHelper.js";

export default class SafeGrass {
    /**
     * @static
     * @method generate
     * @description
     * Synthesizes a vibrant, non-transparent grass texture using direct pixel manipulation.
     * Guaranteed to bloom in under 50ms, even within the constricted thread of a Worker.
     * 
     * @param {number} [width=256] - The horizontal extent of the vessel.
     * @param {number} [height=256] - The vertical extent of the vessel.
     * @returns {HTMLCanvasElement|OffscreenCanvas} The materialized canvas.
     */
    static generate(width = 256, height = 256) {
        try {
            const canvas = CanvasHelper.create(width, height);
            const ctx = canvas.getContext('2d');

            // B"H: We create a single buffer to hold all the letters of the field.
            const imgData = ctx.createImageData(width, height);
            const data = imgData.data;

            const TAU = Math.PI * 2;
            const dark = [28, 96, 36];
            const mid = [54, 142, 56];
            const light = [94, 178, 82];
            const clamp = value => Math.max(0, Math.min(255, value | 0));
            const mix = (a, b, t) => a + (b - a) * t;

            for (let y = 0; y < height; y++) {
                const v = y / height;
                for (let x = 0; x < width; x++) {
                    const u = x / width;
                    const longWave = 0.5 + 0.5 * Math.sin(TAU * (u * 2 + v * 1.5));
                    const crossWave = 0.5 + 0.5 * Math.cos(TAU * (u * 4 - v * 3));
                    const bladeLine = Math.pow(0.5 + 0.5 * Math.sin(TAU * (u * 18 + Math.sin(TAU * v * 2) * 0.08)), 4);
                    const shade = Math.min(1, longWave * 0.42 + crossWave * 0.28 + bladeLine * 0.3);
                    const base = shade < 0.55 ? dark : mid;
                    const top = shade < 0.55 ? mid : light;
                    const t = shade < 0.55 ? shade / 0.55 : (shade - 0.55) / 0.45;
                    const idx = (y * width + x) * 4;

                    data[idx] = clamp(mix(base[0], top[0], t));
                    data[idx + 1] = clamp(mix(base[1], top[1], t));
                    data[idx + 2] = clamp(mix(base[2], top[2], t));
                    data[idx + 3] = 255; // B"H: ABSOLUTE OPACITY. No transparency allowed in the floor!
                }
            }

            // The Word is spoken once. The buffer is poured into the context.
            ctx.putImageData(imgData, 0, 0);

            // B"H: silent


            return canvas;

        } catch (e) {
            console.error('B"H - 🚨 [SafeGrass]: The bloom was interrupted:', e);
            // Emergency fallback: Solid Emerald Green
            const emergency = CanvasHelper.create(64, 64);
            const eCtx = emergency.getContext('2d');
            eCtx.fillStyle = '#228B22';
            eCtx.fillRect(0, 0, 64, 64);
            return emergency;
        }
    }
}
