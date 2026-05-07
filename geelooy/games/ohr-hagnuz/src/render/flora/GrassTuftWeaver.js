
/**
 * B"H
 * @class GrassTuftWeaver
 * @chapter The Sprouting of the Earth
 */
export class GrassTuftWeaver {
    /**
     * @description Draws a cluster of grass blades with varied colors.
     */
    static weave(ctx, x, y, seed) {
        ctx.save();
        ctx.translate(x, y);
        
        const s = Math.abs(seed);
        const numBlades = 2 + (s % 3);
        
        ctx.lineCap = 'round';
        
        for (let i = 0; i < numBlades; i++) {
            const angle = (i - (numBlades / 2)) * 0.4;
            const h = 5 + ((s + i) % 8);
            
            // Choose a holy green frequency
            ctx.strokeStyle = (s + i) % 2 === 0 ? '#43a047' : '#2e7d32';
            ctx.lineWidth = 1.5 + (s % 1.5);
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            // Curved blades for organic beauty
            ctx.quadraticCurveTo(
                Math.sin(angle) * (h / 2), -h / 2,
                Math.sin(angle) * h, -h
            );
            ctx.stroke();
        }
        
        ctx.restore();
    }
}
