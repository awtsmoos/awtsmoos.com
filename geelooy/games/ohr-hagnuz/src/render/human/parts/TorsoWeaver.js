
import { HumanColors } from '../constants/HumanColors.js';

/**
 * B"H
 * @class TorsoWeaver
 * @chapter The Harmony of the Heart
 */
export class TorsoWeaver {
    /**
     * @description Materializes the central body.
     */
    static weave(ctx, size, dir, forceColor) {
        ctx.save();
        
        const isSide = dir === 'l' || dir === 'r';
        const tw = isSide ? size / 3.4 : size / 2.2;
        const th = size / 1.95;
        const shirtColor = forceColor || HumanColors.SHIRT;
        
        ctx.fillStyle = shirtColor;
        ctx.beginPath();
        const tx = isSide ? (dir === 'l' ? 1 : -1) : 0;
        ctx.roundRect(-tw / 2 + tx, -size / 4, tw, th, size / 11);
        ctx.fill();
        
        // Shading to represent the folding of light
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        const sx = dir === 'l' ? -tw/2 : tw/2 - 4;
        ctx.fillRect(sx, -size/4 + 4, 4, th - 8);

        ctx.restore();
    }
}
