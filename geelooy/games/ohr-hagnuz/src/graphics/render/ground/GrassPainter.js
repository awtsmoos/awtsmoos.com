
import { GrassTuftWeaver } from '../../../render/flora/GrassTuftWeaver.js';
import { OrganicSplotchWeaver } from '../../../render/flora/OrganicSplotchWeaver.js';

/**
 * B"H
 * @class GrassPainter
 * @chapter The Garden of Pardes
 * @description
 * Every instant, the Speech of the Creator refreshes the grass. 
 * We simulate this infinite variety by layering procedural splotches 
 * and structural tufts.
 */
export class GrassPainter {
    static draw(ctx, x, y, size, seed, isDetailed) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1;
        const s = Math.abs(seed);

        // LEVEL 1: THE RICH SOIL (Foundation)
        ctx.fillStyle = '#1b4d3e'; 
        ctx.fillRect(fx, fy, fSize, fSize);

        // LEVEL 2: ORGANIC TEXTURE (Breaking the Grid)
        // We weave splotches that overlap and blend
        OrganicSplotchWeaver.weave(ctx, fx, fy, size, s, '#2e7d32');
        OrganicSplotchWeaver.weave(ctx, fx - 10, fy + 10, size, s * 3, '#1b5e20');

        // LEVEL 3: PROCEDURAL TUFTS (The Individual Life)
        const tuftCount = isDetailed ? 10 : 4;
        for (let i = 0; i < tuftCount; i++) {
            const tx = fx + ((s * (i + 1) * 11) % (size - 10)) + 5;
            const ty = fy + ((s * (i + 1) * 13) % (size - 10)) + 5;
            GrassTuftWeaver.weave(ctx, tx, ty, s + i);
        }

        // LEVEL 4: THE SPARKS (Wild Details)
        if (isDetailed &amp;&amp; (s % 10 > 6)) {
            this._drawSpark(ctx, fx, fy, size, s);
        }
    }

    static _drawSpark(ctx, x, y, size, seed) {
        const colors = ['#f44336', '#ffeb3b', '#ce93d8', '#ffffff'];
        ctx.fillStyle = colors[seed % colors.length];
        const px = x + (seed * 17 % (size - 10));
        const py = y + (seed * 23 % (size - 10));
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Holy glow
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}
