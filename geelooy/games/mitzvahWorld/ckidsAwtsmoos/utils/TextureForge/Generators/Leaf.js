
/**
 * B"H
 * @module LeafGenerator
 * @description
 * 🍃 CHAPTER 2: THE VEINS OF THE FOREST 🍃
 * 
 * Generates the intricate, fractal patterns of foliage using high-frequency 
 * noise. Every pixel is a breath of the forest.
 * 
 * @class LeafGenerator
 */
import Noise from "../Noise.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import CanvasHelper from "../CanvasHelper.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class LeafGenerator {
    static generate(width = 128, height = 128) {
        try {
            const canvas = CanvasHelper.create(width, height);
            const ctx = canvas.getContext('2d');
            const imgData = ctx.createImageData(width, height);
            const data = imgData.data;
            const noise = new Noise();

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const nx = x * 0.08;
                    const ny = y * 0.08;
                    
                    // Create a vein-like structure by using absolute noise
                    let val = 1.0 - Math.abs(noise.fractal(nx, ny, 4));
                    
                    // Sefirotic Forest Palette
                    let r = 10 + (val * 40);
                    let g = 60 + (val * 120);
                    let b = 10 + (val * 40);

                    const index = (y * width + x) * 4;
                    data[index]     = r;
                    data[index + 1] = g;
                    data[index + 2] = b;
                    data[index + 3] = 255; // B"H: Absolute existence
                }
            }

            ctx.putImageData(imgData, 0, 0);
            return canvas;
        } catch(e) {
            console.error("B\"H - 🍃 Leaf generation shattered:", e);
            const err = CanvasHelper.create(64,64);
            const eCtx = err.getContext('2d');
            eCtx.fillStyle = '#004400';
            eCtx.fillRect(0,0,64,64);
            return err;
        }
    }
}
