
import { StateRegister } from '../../../binah/StateRegister.js';

/**
 * B"H
 * @class FacadeWeaver
 * @chapter The Windows of the Soul
 * @description
 * Draws a front-facing brick wall. If the tile is the central body of a house, 
 * it weaves a beautiful window. At night, the window glows with inner light.
 */
export class FacadeWeaver {
    static draw(ctx, size, palette, seed, hasWindow = false) {
        // Base Foundation
        ctx.fillStyle = palette.base;
        ctx.fillRect(0, 0, size, size);

        // Brick Jitter
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = palette.alt;
        for(let i=0; i<3; i++) {
            const bx = (seed * i * 7) % size;
            const by = (seed * i * 13) % size;
            ctx.fillRect(bx, by, size/2, size/3);
        }
        ctx.globalAlpha = 1.0;

        // Mortar Lines (The Boundaries of Form)
        ctx.strokeStyle = palette.alt;
        ctx.lineWidth = 1;
        const bW = size / 3;
        const bH = size / 4;
        for (let r = 0; r < 4; r++) {
            const offset = (r % 2 === 0) ? bW / 2 : 0;
            for (let c = -1; c < 4; c++) {
                ctx.strokeRect(c * bW + offset, r * bH, bW, bH);
            }
        }

        // Window Weaving
        if (hasWindow) {
            this._drawWindow(ctx, size);
        }
    }

    static _drawWindow(ctx, size) {
        const isNight = StateRegister.TimeState.timeOfDay === 'NIGHT';
        const wW = size * 0.4;
        const wH = size * 0.5;
        const oX = (size - wW) / 2;
        const oY = (size - wH) / 2;

        // Wooden Window Frame
        ctx.fillStyle = '#4e342e';
        ctx.fillRect(oX - 2, oY - 2, wW + 4, wH + 4);

        // The Glass / Light
        if (isNight) {
            ctx.fillStyle = '#ffb300'; // Golden glow of study
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ffd54f';
        } else {
            ctx.fillStyle = '#81d4fa'; // Reflection of the daytime sky
            ctx.shadowBlur = 0;
        }
        ctx.fillRect(oX, oY, wW, wH);

        // Crossbars
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#4e342e';
        ctx.fillRect(oX + wW/2 - 1, oY, 2, wH); // Vertical
        ctx.fillRect(oX, oY + wH/2 - 1, wW, 2); // Horizontal
    }
}
