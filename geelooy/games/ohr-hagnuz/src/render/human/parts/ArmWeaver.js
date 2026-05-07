
import { HumanColors } from '../constants/HumanColors.js';

/**
 * B"H
 * @class ArmWeaver
 * @chapter The Hands of the Scribe
 * @description
 * Every action requires an instrument. The arms represent the Sefirot 
 * of Chesed (Right) and Gevurah (Left). This class ensures that both 
 * instruments are visible and properly aligned to the torso's 
 * dimensional projection.
 */
export class ArmWeaver {
    /**
     * @description Materializes a limb into the coordinate space.
     * @param {CanvasRenderingContext2D} ctx - The pen of the scribe.
     * @param {number} size - Tile dimension.
     * @param {number} swing - Current kinetic swing offset.
     * @param {string} dir - Facing direction (u, d, l, r).
     * @param {boolean} isLeft - Is this the left side limb?
     * @param {string} forceColor - Optional garment color.
     */
    static weave(ctx, size, swing, dir, isLeft, forceColor) {
        ctx.save();
        
        const isSide = dir === 'l' || dir === 'r';
        const shirtColor = forceColor || HumanColors.SHIRT;
        const skinColor = HumanColors.SKIN;
        const armWidth = size / 8;
        
        // --- DEPTH SORTING (Tzimtzum) ---
        // In side-profile, the "back arm" (furthest from viewer) is dimmed
        const isBackArm = (dir === 'r' && isLeft) || (dir === 'l' && !isLeft);
        if (isSide && isBackArm) {
            ctx.globalAlpha = 0.45;
        }

        // --- ANCHOR POINT CALCULATION ---
        let ox = 0;
        if (!isSide) {
            // Front/Back view: Arms are anchored to the shoulders
            ox = isLeft ? -size / 3.4 : size / 3.4;
        } else {
            // Side view: Arms are anchored closer to the vertical center line
            // Slightly offset so they aren't exactly on top of each other
            ox = isLeft ? -2 : 2;
        }

        ctx.lineWidth = armWidth;
        ctx.lineCap = 'round';
        
        // --- THE SLEEVE (The Garment of Action) ---
        ctx.strokeStyle = shirtColor;
        ctx.beginPath();
        ctx.moveTo(ox, -size / 6);
        
        // The path of the swing
        // In side view, we swing left/right (X). In front view, we swing up/down (Y).
        const targetX = isSide ? ox + (isLeft ? -swing : swing) : ox;
        const targetY = isSide ? size / 8 : size / 8 + swing;
        
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // --- THE HAND (The Spark of Creation) ---
        ctx.strokeStyle = skinColor;
        ctx.beginPath();
        ctx.moveTo(targetX, targetY);
        // Small directional finger-offset for side views
        const fingerX = isSide ? (dir === 'r' ? 3 : -3) : 0;
        ctx.lineTo(targetX + fingerX, targetY + (isSide ? 3 : 6));
        ctx.stroke();

        ctx.restore();
    }
}
