
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file DivineRenderer.js
 * 
 * Chapter: "Let there be light."
 * The screen was just blue because the void was empty (Tohu VaVohu).
 * The engine was ticking, but the brush was not striking the canvas!
 * 
 * This module takes the pure Canvas context and writes the Or Ein Sof 
 * (Infinite Light) onto it every single frame, generating beautiful, 
 * constantly shifting Sefirotic geometry to prove the engine is alive.
 */

/**
 * @class DivineRenderer
 * @extends SederHishtalshelusNode
 * @description Injects graphics into the canvas vessel during the rendering loop.
 */
export default class DivineRenderer extends SederHishtalshelusNode {
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} context - The pure drawing interface.
     * @param {HTMLCanvasElement} canvas - The physical bounds.
     */
    constructor(context, canvas) {
        super({ worldName: "Yetzirah_Visual_Rendering" });
        this.ctx = context;
        this.canvas = canvas;
        this.timeElapsed = 0;
    }

    /**
     * @method renderFrame
     * @description Uttered every millisecond to recreate the visual matrix.
     * @param {number} deltaTime - Time since last breath.
     */
    renderFrame(deltaTime) {
        this.timeElapsed += deltaTime * 0.001; // Convert to seconds for fluid math

        const w = this.canvas.width;
        const h = this.canvas.height;
        const centerX = w / 2;
        const centerY = h / 2;

        // 1. Wipe the void clean (Nullification before recreation)
        this.ctx.fillStyle = '#050510'; // Deep abyss color
        this.ctx.fillRect(0, 0, w, h);

        // 2. Draw the Or Ein Sof (Infinite Light) pulsating
        const maxRadius = Math.min(w, h) * 0.4;
        
        for (let i = 1; i <= 10; i++) { // The 10 Sefirot
            this.ctx.beginPath();
            
            // Calculate pulsating radius using divine geometry (sine waves)
            const dynamicRadius = maxRadius * (i / 10) + Math.sin(this.timeElapsed * i) * 10;
            this.ctx.arc(centerX, centerY, dynamicRadius, 0, Math.PI * 2);
            
            // Generate ethereal colors
            const hue = (this.timeElapsed * 50 + (i * 36)) % 360;
            this.ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${0.1 + (i * 0.05)})`;
            this.ctx.lineWidth = 2 + Math.cos(this.timeElapsed * 2) * 1;
            
            this.ctx.stroke();
            this.ctx.closePath();
        }

        // 3. The Central Spark (Malkhut)
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 5 + Math.abs(Math.sin(this.timeElapsed * 5)) * 10, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#00ffff';
        this.ctx.fill();
        this.ctx.closePath();
        
        // Reset shadow to prevent corrupting other vessels
        this.ctx.shadowBlur = 0;
    }
}
