
import { WorldData } from '../../data/WorldData.js';
import { State } from '../../binah/State.js';

/**
 * B"H
 * @class Architecture
 * @chapter The Master Builder (Bezalel)
 */
export class Architecture {
    /**
     * @description Materializes a building block with context-aware textures.
     */
    static draw(ctx, x, y, size, rx, ry) {
        ctx.save();
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fS = size + 1; // Crush the gaps

        ctx.translate(fx, fy);
        ctx.beginPath();
        ctx.rect(0, 0, fS, fS);
        ctx.clip();

        const map = WorldData[State.MapId];
        
        // Logic check: Is there a building block directly beneath this coordinate?
        const charBelow = (ry + 1 < map.length) ? [...map[ry + 1]][rx] : null;
        const isFacade = charBelow !== 'W' && charBelow !== '☗' && charBelow !== '★' && charBelow !== '♜';

        if (isFacade) {
            this._drawFacade(ctx, size, rx, ry);
        } else {
            this._drawRoof(ctx, size, rx, ry);
        }

        ctx.restore();
    }

    static _drawFacade(ctx, size, rx, ry) {
        // Base Brick Tone
        ctx.fillStyle = '#d7ccc8';
        ctx.fillRect(0, 0, size, size);

        // Brick mortar lines
        ctx.strokeStyle = '#bcaaa4';
        ctx.lineWidth = 1;
        const bW = size / 3;
        const bH = size / 4;
        
        for (let r = 0; r < 4; r++) {
            const shift = (r % 2 === 0) ? bW / 2 : 0;
            for (let c = -1; c < 4; c++) {
                ctx.strokeRect(c * bW + shift, r * bH, bW, bH);
            }
        }
        
        // Subtle brick shading
        const seed = Math.abs(rx * 31 + ry * 17);
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect((seed % 3) * bW, (seed % 4) * bH, bW, bH);
    }

    static _drawRoof(ctx, size, rx, ry) {
        // Warm Wood Tone
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(0, 0, size, size);

        // Shingle arcs
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        const sW = size / 3;
        const sH = size / 4;
        
        for (let r = 0; r < 4; r++) {
            const offset = (r % 2 === 0) ? sW / 2 : 0;
            for (let c = 0; c < 4; c++) {
                ctx.beginPath();
                ctx.arc(c * sW + offset, r * sH, sW / 1.5, 0, Math.PI);
                ctx.stroke();
            }
        }
    }

    static drawDoor(ctx, x, y, size) {
        ctx.save();
        ctx.translate(Math.floor(x), Math.floor(y));
        
        // Background facade
        ctx.fillStyle = '#d7ccc8';
        ctx.fillRect(0, 0, size, size);

        // Dark Recess
        ctx.fillStyle = '#1e110a';
        ctx.fillRect(size * 0.15, size * 0.2, size * 0.7, size * 0.8);
        
        // Wood Panel
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(size * 0.2, size * 0.25, size * 0.6, size * 0.75);

        // Handle (The golden spark)
        ctx.fillStyle = '#ffb300';
        ctx.beginPath();
        ctx.arc(size * 0.7, size * 0.6, size * 0.05, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
