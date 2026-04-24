
/**
 * B"H
 * @module SafeGrass
 * @description
 * "He causes grass to sprout for cattle..." (Tehillim 104:14).
 * This module generates a highly stable, non-shader procedural grass texture.
 * It uses pure Canvas 2D context to splatter tens of thousands of natural green 
 * sparks (pixels) across a deep green void, creating a lush texture that will never crash.
 */
import CanvasHelper from "../CanvasHelper.js";

export default class SafeGrass {
    /**
     * @function generate
     * @description Paints the canvas with the sparks of organic life.
     * @param {number} width 
     * @param {number} height 
     * @returns {HTMLCanvasElement|OffscreenCanvas}
     */
    static generate(width = 512, height = 512) {
        try {
            const canvas = CanvasHelper.create(width, height);
            const ctx = canvas.getContext('2d');
            
            // 1. The Foundation: Deep Earthy Green
            ctx.fillStyle = '#1e3f1a'; 
            ctx.fillRect(0, 0, width, height);
            
            // 2. The Sparks: Vibrant, varied blades of grass
            const colors = ['#2d5a27', '#3a7533', '#4c8c43', '#1b3817', '#5da852'];
            
            const dropSparks = (count, size) => {
                for(let i = 0; i < count; i++) {
                    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                    const x = Math.random() * width;
                    const y = Math.random() * height;
                    ctx.fillRect(x, y, size, size);
                }
            };

            // Broad strokes
            dropSparks(20000, 4);
            // Fine details
            dropSparks(50000, 2);
            // Tiny highlights
            dropSparks(10000, 1);

            return canvas;
        } catch (e) {
            console.error("B\"H - ⚡ SafeGrass generation failed. Returning emergency blank canvas.", e);
            const emergency = CanvasHelper.create(64, 64);
            const eCtx = emergency.getContext('2d');
            eCtx.fillStyle = '#00ff00';
            eCtx.fillRect(0,0,64,64);
            return emergency;
        }
    }
}
