
/**
 * B"H
 * @class OrganicSplotchWeaver
 */
export class OrganicSplotchWeaver {
    /**
     * @description Paints a soft, irregular patch of organic color.
     */
    static weave(ctx, x, y, size, seed, color) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = color;
        
        const s = Math.abs(seed);
        const radius = (size / 2) + (s % (size / 2));
        
        ctx.beginPath();
        // Use an irregular ellipse to prevent the "bubble" look
        ctx.ellipse(
            x + (s % size), 
            y + ((s * 7) % size), 
            radius, 
            radius * 0.7, 
            s * 0.1, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }
}
