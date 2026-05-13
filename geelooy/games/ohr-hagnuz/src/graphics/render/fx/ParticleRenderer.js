
import { StateRegister } from '../../../binah/StateRegister.js';

/**
 * B"H
 * @class ParticleRenderer
 * @chapter The Visibility of the Hidden
 * @description
 * Draws the array of active particles. As they decay, their alpha drops.
 * They spin gently, reminding the observer that all matter is just swirling text.
 */
export class ParticleRenderer {
    static draw(ctx, camX, camY) {
        const P = StateRegister.Particles;
        if (P.length === 0) return;

        ctx.save();
        ctx.font = 'bold 16px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        P.forEach(p => {
            const sx = p.x - camX;
            const sy = p.y - camY;

            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            
            ctx.translate(sx, sy);
            ctx.rotate(p.rotation);
            ctx.scale(p.scale, p.scale);
            
            // Outer glow of the holy letter
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            
            ctx.fillText(p.char, 0, 0);
            
            // Reset transforms for next particle
            ctx.scale(1/p.scale, 1/p.scale);
            ctx.rotate(-p.rotation);
            ctx.translate(-sx, -sy);
        });

        ctx.restore();
    }
}
