
import { StateRegister } from '../binah/StateRegister.js';

/**
 * B"H
 * @class PathRenderer
 * @chapter The Luminescent Trail
 * @description
 * "Your word is a lamp to my feet and a light to my path" (Psalms 119:105).
 * This class translates the internal HeroPath into visual pixels on the OBJ layer.
 */
export class PathRenderer {
    /**
     * @description Draws the projected path of the Tzaddik.
     * @param {CanvasRenderingContext2D} ctx - The object layer context.
     * @param {number} camX - Camera horizontal offset.
     * @param {number} camY - Camera vertical offset.
     * @param {number} RES - Resolution (64px).
     */
    static draw(ctx, camX, camY, RES) {
        const path = StateRegister.HeroPath;
        const target = StateRegister.PathTarget;

        if (!target) return;

        ctx.save();

        // 1. Draw Target Marker (The focal point of the Will)
        const tx = (target.x * RES) - camX;
        const ty = (target.y * RES) - camY;
        
        ctx.fillStyle = target.valid ? 'rgba(0, 229, 255, 0.3)' : 'rgba(255, 23, 68, 0.4)';
        ctx.shadowBlur = 15;
        ctx.shadowColor = target.valid ? '#00e5ff' : '#ff1744';
        ctx.fillRect(tx + RES*0.1, ty + RES*0.1, RES*0.8, RES*0.8);

        // 2. Draw Connection Line (The flow of Shefa)
        if (target.valid && path.length > 0) {
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.setLineDash([15, 10]); // Pulsing dash effect
            ctx.lineDashOffset = -performance.now() / 30;

            ctx.beginPath();
            
            // Start line from the center of the Hero's current physical position
            const hx = StateRegister.HeroPos.dx - camX + RES / 2;
            const hy = StateRegister.HeroPos.dy - camY + RES / 2;
            ctx.moveTo(hx, hy);
            
            path.forEach(node => {
                const nx = (node.x * RES) - camX + RES / 2;
                const ny = (node.y * RES) - camY + RES / 2;
                ctx.lineTo(nx, ny);
            });
            
            ctx.stroke();
        }

        ctx.restore();
    }
}
