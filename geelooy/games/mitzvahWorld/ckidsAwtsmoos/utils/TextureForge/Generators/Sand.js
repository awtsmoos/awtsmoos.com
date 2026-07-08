
/**
 * B"H
 * @module SandGenerator
 * @description
 * 🏜️ CHAPTER 5: THE DUST OF THE EARTH 🏜️
 */
import Noise from "../Noise.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import CanvasHelper from "../CanvasHelper.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class SandGenerator {
    static generate(width = 256, height = 256) {
        try {
            const canvas = CanvasHelper.create(width, height);
            const ctx = canvas.getContext('2d');
            const imgData = ctx.createImageData(width, height);
            const data = imgData.data;
            const noise = new Noise();

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const nx = x * 0.8; // High frequency for grains
                    const ny = y * 0.8;
                    const val = noise.fractal(nx, ny, 2);
                    const normalized = (val + 1) / 2;
                    
                    // Golden desert hues
                    const r = 220 + normalized * 35;
                    const g = 190 + normalized * 35;
                    const b = 130 + normalized * 45;

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
            console.error("B\"H - 🏜️ Sand generation shattered:", e);
            const err = CanvasHelper.create(64,64);
            const eCtx = err.getContext('2d');
            eCtx.fillStyle = '#C2B280';
            eCtx.fillRect(0,0,64,64);
            return err;
        }
    }
}
