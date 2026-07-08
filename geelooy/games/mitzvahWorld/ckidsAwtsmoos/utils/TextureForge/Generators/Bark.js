
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
import Noise from "../Noise.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import CanvasHelper from "../CanvasHelper.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class BarkGenerator {
    static generate(width = 512, height = 512) {
        try {
            const canvas = CanvasHelper.create(width, height);
            const ctx = canvas.getContext('2d');
            const imgData = ctx.createImageData(width, height);
            const data = imgData.data;
            const noise = new Noise();

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    // B"H: Multiple layers of noise for deep, rich bark grain
                    // Coarse vertical grain channels
                    const grain = noise.fractal(x * 0.04, y * 0.008, 5);
                    
                    // Fine surface detail
                    const detail = noise.fractal(x * 0.3, y * 0.05, 3) * 0.4;
                    
                    // Horizontal ring hints (like growth rings on the side)
                    const ring = Math.sin(y * 0.15 + noise.fractal(x * 0.02, y * 0.01, 2) * 8.0) * 0.15;
                    
                    const val = (grain + detail + ring + 1.0) / 2.2;
                    const normalized = Math.max(0, Math.min(1, val));
                    
                    // B"H: Deep earthy tones with dramatic range
                    // Dark crevices → warm brown ridges
                    const darken = Math.pow(normalized, 1.6);
                    const r = Math.floor(20 + darken * 100);  // 20 - 120 range
                    const g = Math.floor(10 + darken * 60);   // 10 - 70 range
                    const b = Math.floor(5  + darken * 30);   // 5  - 35 range

                    const index = (y * width + x) * 4;
                    data[index]     = r;
                    data[index + 1] = g;
                    data[index + 2] = b;
                    data[index + 3] = 255; 
                }
            }

            ctx.putImageData(imgData, 0, 0);
            
            // B"H: Add a second pass — bright ridge highlights as vertical strokes
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.08;
            const noiseInst = new Noise();
            for (let i = 0; i < 30; i++) {
                const xp = Math.random() * width;
                const roughness = 15 + Math.random() * 20;
                ctx.beginPath();
                ctx.moveTo(xp, 0);
                for (let yp = 0; yp < height; yp += 4) {
                    ctx.lineTo(xp + noiseInst.fractal(xp * 0.01, yp * 0.02, 2) * roughness, yp);
                }
                ctx.strokeStyle = `rgba(180, 130, 80, 0.6)`;
                ctx.lineWidth = 1 + Math.random() * 2;
                ctx.stroke();
            }
            
            return canvas;
        } catch(e) {
            console.error("B\"H - 🪵 Bark generation shattered:", e);
            const err = CanvasHelper.create(64, 64);
            const eCtx = err.getContext('2d');
            eCtx.fillStyle = '#4B2511';
            eCtx.fillRect(0, 0, 64, 64);
            return err;
        }
    }
}

