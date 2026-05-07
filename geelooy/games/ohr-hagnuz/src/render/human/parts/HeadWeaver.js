
import { HumanColors } from '../constants/HumanColors.js';

/**
 * B"H
 * @class HeadWeaver
 * @chapter The Keter of the Body
 */
export class HeadWeaver {
    /**
     * @description Materializes the cranium and facial features.
     */
    static weave(ctx, size, dir) {
        ctx.save();
        
        const hr = size / 5.2;
        const hy = -size / 2.5;
        const isSide = dir === 'l' || dir === 'r';
        
        // The Brain Case (Vessel of Thought)
        ctx.fillStyle = HumanColors.SKIN;
        ctx.beginPath();
        const hx = isSide ? (dir === 'l' ? -3 : 3) : 0;
        ctx.arc(hx, hy, hr, 0, Math.PI * 2);
        ctx.fill();

        // The Kippah (Nullification to the Above)
        ctx.fillStyle = HumanColors.KIPPAH;
        ctx.beginPath();
        const kw = isSide ? hr * 0.75 : hr * 0.9;
        ctx.ellipse(hx, hy - hr + 2, kw, hr * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();

        // The Eyes (Perception of Reality)
        if (dir === 'd' || isSide) {
            ctx.fillStyle = HumanColors.EYES;
            const es = size / 24;
            if (!isSide) {
                ctx.fillRect(-hr / 2, hy, es, es);
                ctx.fillRect(hr / 2 - es, hy, es, es);
            } else {
                const ex = hx + (dir === 'l' ? -hr / 1.4 : hr / 1.4 - es);
                ctx.fillRect(ex, hy, es, es);
            }
        }

        ctx.restore();
    }
}
