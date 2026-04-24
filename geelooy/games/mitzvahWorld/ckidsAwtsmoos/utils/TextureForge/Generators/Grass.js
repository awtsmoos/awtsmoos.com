
/**
 * B"H
 * @module GrassGenerator
 */
import Noise from "../Noise.js";
import CanvasHelper from "../CanvasHelper.js";

export default class GrassGenerator {
    static generate(width = 256, height = 256) {
        const canvas = CanvasHelper.create(width, height);
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;
        const noise = new Noise();

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const nx = x * 0.1;
                const ny = y * 0.1;
                const val = noise.fractal(nx, ny, 4);
                const normalized = (val + 1) / 2;
                
                const r = 30 + normalized * 50;
                const g = 100 + normalized * 80;
                const b = 30 + normalized * 40;

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
