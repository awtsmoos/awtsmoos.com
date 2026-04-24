
/**
 * B"H
 * @module BarkGenerator
 * @description
 * The Etz Chayim (Tree of Life) requires a sturdy exterior to protect the flowing 
 * sap (light) within. This generator stretches the primordial noise vertically to 
 * form the rugged, protective grooves of tree bark.
 * 
 * "Deep grooves of brown, a history told, 
 * in every branch, the Divine we behold."
 */
import Noise from "../Noise.js";

export default class BarkGenerator {
    static generate(width = 256, height = 256) {
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;
        const noise = new Noise();

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Stretch noise vertically to create bark grooves
                const nx = x * 0.05;
                const ny = y * 0.01;
                
                const val = noise.fractal(nx, ny, 6);
                
                // Map noise [-1, 1] to [0, 1]
                const normalized = (val + 1) / 2;
                
                // Color interpolation: Dark brown to light greyish brown
                const r = 60 + normalized * 40;
                const g = 40 + normalized * 30;
                const b = 20 + normalized * 20;

                const index = (y * width + x) * 4;
                data[index] = r;
                data[index + 1] = g;
                data[index + 2] = b;
                data[index + 3] = 255;
            }
        }

        ctx.putImageData(imgData, 0, 0);
        return canvas;
    }
}
