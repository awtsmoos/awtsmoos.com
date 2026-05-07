
import { HumanColors } from '../constants/HumanColors.js';

/**
 * B"H
 * @class LegWeaver
 * @chapter The Walk of the Tzaddik
 */
export class LegWeaver {
    /**
     * @description Materializes the lower limbs.
     */
    static weave(ctx, size, swing, dir) {
        ctx.save();
        ctx.fillStyle = HumanColors.PANTS;
        
        const isSide = dir === 'l' || dir === 'r';
        const lw = size / 6;
        const lh = size / 3;

        if (isSide) {
            // Overlapping legs for profile walk
            ctx.fillRect(-lw + swing, size/8, lw, lh);
            ctx.globalAlpha = 0.5;
            ctx.fillRect(-lw - swing, size/8, lw, lh);
            ctx.globalAlpha = 1.0;
        } else {
            // Front/Back view: distinct left and right legs
            // For 'up' or 'down', we alternate the height slightly with the swing
            ctx.fillRect(-size/4, size/8, lw, lh + (dir==='d'?swing:-swing));
            ctx.fillRect(size/10, size/8, lw, lh + (dir==='d'?-swing:swing));
        }

        ctx.restore();
    }
}
