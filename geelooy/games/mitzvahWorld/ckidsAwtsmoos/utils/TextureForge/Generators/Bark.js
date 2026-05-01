
/**
 * B"H
 * @module BarkGenerator
 * @description
 * 🪵 CHAPTER 1: THE SKIN OF THE TREE 🪵
 * 
 * Engraves the ancient, vertical grain of wood into the digital parchment.
 * 
 * @class BarkGenerator
 */
import Noise from "../Noise.js";
import CanvasHelper from "../CanvasHelper.js";

export default class BarkGenerator {
    static generate(width = 256, height = 256) {
        try {
            const canvas = CanvasHelper.create(width, height);
            const ctx = canvas.getContext('2d');
            const imgData = ctx.createImageData(width, height);
            const data = imgData.data;
            const noise = new Noise();

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    // Stretched vertically for a bark look
                    const nx = x * 0.15;
                    const ny = y * 0.02;
                    const val = noise.fractal(nx, ny, 6);
                    const normalized = (val + 1) / 2;
                    
                    // Earthy tones of wood
                    const r = 50 + normalized * 60;
                    const g = 30 + normalized * 40;
                    const b = 15 + normalized * 25;

                    const index = (y * width + x) * 4;
                    data[index]     = r;
                    data[index + 1] = g;
                    data[index + 2] = b;
                    data[index + 3] = 255; 
                }
            }

            ctx.putImageData(imgData, 0, 0);
            return canvas;
        } catch(e) {
            console.error("B\"H - 🪵 Bark generation shattered:", e);
            const err = CanvasHelper.create(64,64);
            const eCtx = err.getContext('2d');
            eCtx.fillStyle = '#4B2511';
            eCtx.fillRect(0,0,64,64);
            return err;
        }
    }
}
