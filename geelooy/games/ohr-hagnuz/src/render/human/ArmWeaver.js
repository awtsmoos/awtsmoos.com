
/**
 * B"H
 * @class ArmWeaver
 * @chapter The Hands of the Tzaddik
 * @description
 * "The voice is the voice of Jacob, but the hands are the hands of Esau." 
 * Here, we transform that paradigm—the hands themselves become vessels 
 * for the holy work. 
 * 
 * This module draws a single arm, calculating its swing based on the 
 * rhythmic pulse of the walk cycle.
 */
export class ArmWeaver {
    /**
     * @description Materializes an arm into the physical coordinate space.
     * @param {CanvasRenderingContext2D} ctx - The pen of the scribe.
     * @param {number} size - The physical dimension of the tile.
     * @param {number} swing - The kinetic extension of the limb.
     * @param {string} shirtColor - The garment of the torso.
     * @param {string} skinColor - The clay of the earth.
     * @param {boolean} isBackArm - Does this arm reside in the hidden dimension (behind)?
     * @param {string} dir - The orientation of the face (u, d, l, r).
     */
    static weave(ctx, size, swing, shirtColor, skinColor, isBackArm, dir) {
        ctx.save();
        
        const isSide = dir === 'l' || dir === 'r';
        const armWidth = size / 7.5;
        
        // If it's a side view, the back arm is slightly dimmed to represent depth (Tzimtzum)
        if (isSide &amp;&amp; isBackArm) {
            ctx.globalAlpha = 0.5;
        }

        // Horizontal offset based on view and which arm it is
        let ox = 0;
        if (!isSide) {
            ox = isBackArm ? size / 4 : -size / 4;
        } else {
            // In side view, arms originate closer to the center line
            ox = isBackArm ? -2 : 2;
        }

        ctx.lineWidth = armWidth;
        ctx.lineCap = 'round';
        
        // Draw the Sleeve (The Garment)
        ctx.strokeStyle = shirtColor;
        ctx.beginPath();
        ctx.moveTo(ox, -size / 6);
        // The swing affects the Y in front/back views, and X in side views
        const targetX = isSide ? ox + swing : ox;
        const targetY = isSide ? size / 8 : size / 8 + swing;
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Draw the Hand (The Instrument of Action)
        ctx.strokeStyle = skinColor;
        ctx.beginPath();
        ctx.moveTo(targetX, targetY);
        ctx.lineTo(targetX + (isSide ? (dir === 'r' ? 2 : -2) : 0), targetY + (isSide ? 2 : 5));
        ctx.stroke();

        ctx.restore();
    }
}
