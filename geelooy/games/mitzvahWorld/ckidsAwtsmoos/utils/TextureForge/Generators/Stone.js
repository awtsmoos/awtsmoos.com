
/**
 * B"H
 * @module StoneGenerator
 * @description
 * "And they gathered stones and made a heap."
 * Draws layered circular cobblestones across the canvas to mimic an ancient stone path.
 */
import CanvasHelper from "../CanvasHelper.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class StoneGenerator {
    /**
     * @function generate
     * @description Paints a realistic cobblestone texture.
     */
    static generate(width = 512, height = 512) {
        const canvas = CanvasHelper.create(width, height);
        const ctx = canvas.getContext('2d');
        
        // 1. THE MORTAR (Foundational Shadow)
        ctx.fillStyle = '#2a2a2a'; // Deep charcoal
        ctx.fillRect(0, 0, width, height);

        // 2. THE COBBLESTONES (Individual Sparks)
        const stoneCount = 350;
        for(let i=0; i<stoneCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            
            // Varied sizes suggesting organic growth
            const rX = 12 + Math.random() * 20;
            const rY = 8 + Math.random() * 15;
            const rotation = Math.random() * Math.PI;
            
            // B"H: Every stone is unique!
            const baseGray = 70 + Math.random() * 80;
            const color = `rgb(${baseGray}, ${baseGray + (Math.random()*5)}, ${baseGray + (Math.random()*10)})`;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            
            // Draw the stone body
            ctx.beginPath();
            ctx.ellipse(0, 0, rX, rY, 0, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            
            // Add soft perimeter shading for depth
            ctx.strokeStyle = 'rgba(0,0,0,0.4)';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // 3. THE HIGHLIGHT (Gleam of Holiness)
            const gradient = ctx.createRadialGradient(-rX*0.3, -rY*0.3, 0, 0, 0, rX);
            gradient.addColorStop(0, 'rgba(255,255,255,0.15)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.restore();
        }

        // 4. THE GRIT (Organic Noise)
        const grit = ctx.getImageData(0,0,width,height);
        const buffer = grit.data;
        for(let i=0; i<buffer.length; i+=4) {
            const n = (Math.random() - 0.5) * 15;
            buffer[i] += n; buffer[i+1] += n; buffer[i+2] += n;
        }
        ctx.putImageData(grit, 0, 0);

        return canvas;
    }
}
