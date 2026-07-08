
/**
 * B"H
 * @module BasicPlane
 * @description
 * A fundamental grid of green and dark green lines, providing immediate spatial awareness
 * for the soul descending into the void, generated at near-zero computation cost.
 */
import CanvasHelper from "../CanvasHelper.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class BasicPlane {
    static generate(width = 256, height = 256) {
        const canvas = CanvasHelper.create(width, height);
        const ctx = canvas.getContext('2d');
        
        // Base Emerald
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, 0, width, height);
        
        // The Grid of Order
        ctx.strokeStyle = '#1a6b1a'; // Darker green
        ctx.lineWidth = 2;
        
        const step = 32;
        for(let i = 0; i <= width; i += step) {
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
            
            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }
        
        return canvas;
    }
}
