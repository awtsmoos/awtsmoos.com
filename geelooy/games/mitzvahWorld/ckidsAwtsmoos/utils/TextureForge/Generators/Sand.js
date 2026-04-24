
/**
 * B"H
 * @module SandGenerator
 */
import Noise from "../Noise.js";
import CanvasHelper from "../CanvasHelper.js";

export default class SandGenerator {
    static generate(width = 256, height = 256) {
        const canvas = CanvasHelper.create(width, height);
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;
        const noise = new Noise();

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const nx = x * 0.5; 
                const ny = y * 0.5;
                const val = noise.fractal(nx, ny, 2);
                const normalized = (val + 1) / 2;
                
                const r = 210 + normalized * 45;
                const g = 180 + normalized * 40;
                const b = 120 + normalized * 30;

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
