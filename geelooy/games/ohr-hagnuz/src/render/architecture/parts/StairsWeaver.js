
/**
 * B"H
 * @class StairsWeaver
 * @chapter The Ladder of Ascent (Sulam)
 * @description
 * Draws the physical stairs that teleport the Tzaddik to the upper floors (Aliyot).
 */
export class StairsWeaver {
    static draw(ctx, x, y, size) {
        ctx.save();
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1;
        ctx.translate(fx, fy);

        // Base Wood Floor
        ctx.fillStyle = '#4e342e'; 
        ctx.fillRect(0, 0, fSize, fSize);

        // The Staircase Hole (Dark depth)
        ctx.fillStyle = '#1e110a';
        ctx.fillRect(size * 0.1, size * 0.1, size * 0.8, size * 0.8);

        // The Steps Ascending
        ctx.fillStyle = '#8d6e63'; // Light wood steps
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2;
        
        const numSteps = 5;
        const stepH = (size * 0.8) / numSteps;
        
        for (let i = 0; i < numSteps; i++) {
            // Perspective shrinking: upper steps are slightly narrower
            const stepW = size * 0.8 - (i * 4);
            const ox = (size - stepW) / 2;
            const oy = size * 0.9 - (i * stepH) - stepH;
            
            ctx.fillRect(ox, oy, stepW, stepH);
            ctx.strokeRect(ox, oy, stepW, stepH);
        }

        ctx.restore();
    }
}
