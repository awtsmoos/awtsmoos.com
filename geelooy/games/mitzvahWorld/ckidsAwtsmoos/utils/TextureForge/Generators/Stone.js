
/**
 * B"H
 * @module StoneGenerator
 * @description
 * "Even Ma'asu HaBonim..." The stone the builders rejected has become the chief cornerstone.
 * This procedural generator weaves rigid mathematical noise to form the texture of ancient,
 * immovable rock, the foundation of the newly extruded procedural architecture.
 */
import Noise from "../Noise.js";

export default class StoneGenerator {
    static generate(width = 256, height = 256) {
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;
        const noise = new Noise();

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Cellular-like rock texture
                const nx = x * 0.08;
                const ny = y * 0.08;
                
                let val = Math.abs(noise.fractal(nx, ny, 5));
                // Add blocky artifacting to simulate cut stone
                const blockNoise = Math.floor(noise.fractal(x * 0.02, y * 0.02, 2) * 5) / 5;
                
                val = (val * 0.7) + (blockNoise * 0.3);
                
                const normalized = (val + 1) / 2;
                
                // Ancient grey/blue stone colors
                const r = 90 + normalized * 40;
                const g = 95 + normalized * 45;
                const b = 100 + normalized * 50;

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
