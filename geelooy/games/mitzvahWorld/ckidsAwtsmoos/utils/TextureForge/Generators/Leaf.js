
/**
 * B"H
 * @module LeafGenerator
 * @description
 * The leaves absorb the hidden light and convert it into sustenance. 
 * This module weaves veins of light through a verdant green canvas, 
 * manifesting the intricate network of a leaf from pure data.
 * 
 * "A vibrant green, a sunlit vein, 
 * from the code of life, the world sustains."
 */
import Noise from "../Noise.js";

export default class LeafGenerator {
    static generate(width = 128, height = 128) {
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;
        const noise = new Noise();

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const nx = x * 0.03;
                const ny = y * 0.03;
                
                // Cellular/Vein-like noise using absolute fractal
                let val = Math.abs(noise.fractal(nx, ny, 3));
                val = 1.0 - val; // Invert to make the "creases" dark
                
                // Base Green
                let r = 20 + (val * 30);
                let g = 80 + (val * 100);
                let b = 20 + (val * 30);

                const index = (y * width + x) * 4;
                data[index] = r;
                data[index + 1] = g;
                data[index + 2] = b;
                data[index + 3] = 255; // Solid leaf
            }
        }

        ctx.putImageData(imgData, 0, 0);
        return canvas;
    }
}
