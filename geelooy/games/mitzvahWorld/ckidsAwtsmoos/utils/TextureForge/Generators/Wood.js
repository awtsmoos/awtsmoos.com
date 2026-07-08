
/**
 * B"H
 * @module WoodGenerator
 * @description
 * Draws the life-lines of ancient cedar wood, creating a rich brown grain texture
 * complete with planks and subtle knots.
 */
import CanvasHelper from "../CanvasHelper.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import Noise from "../Noise.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class WoodGenerator {
    static generate(width = 512, height = 512) {
        const canvas = CanvasHelper.create(width, height);
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;
        const noise = new Noise(12345); // Fixed seed for consistent wood

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Stretch the noise vertically for grain, and add sine warp for knots
                const nx = (x / width) * 20 + Math.sin((y / height) * 10) * 2;
                const ny = (y / height) * 2;
                
                let val = noise.fractal(nx, ny, 4);
                // Sharp rings
                val = Math.abs(Math.sin(val * Math.PI * 4));

                const normalized = 0.6 + val * 0.4;
                
                // Deep rich brown
                const r = 90 * normalized;
                const g = 45 * normalized;
                const b = 25 * normalized;

                const index = (y * width + x) * 4;
                data[index] = r;
                data[index + 1] = g;
                data[index + 2] = b;
                data[index + 3] = 255;
            }
        }

        ctx.putImageData(imgData, 0, 0);
        
        // Add Planks Overlay
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 4;
        const numPlanks = 8;
        const plankW = width / numPlanks;
        for (let i = 1; i < numPlanks; i++) {
             ctx.beginPath();
             ctx.moveTo(i * plankW, 0);
             ctx.lineTo(i * plankW, height);
             ctx.stroke();
        }

        // Add some visible knots
        for(let i=0; i<15; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            ctx.beginPath();
            ctx.ellipse(x, y, 4, 15, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(62, 31, 0, 0.4)';
            ctx.fill();
        }

        return canvas;
    }
}
