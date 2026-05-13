
/**
 * B"H
 * @class CrystalPainter
 * @chapter The Sea of Glass
 * @description
 * In Ezekiel's vision, beneath the throne was something like "a pavement of sapphire, like the very sky for clearness."
 * This draws the transparent, geometric floors of Yetzirah.
 */
export class CrystalPainter {
    static draw(ctx, x, y, size, seed) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1;
        const s = Math.abs(seed);

        // Base Ethereal Hue
        ctx.fillStyle = '#e0f7fa'; 
        ctx.fillRect(fx, fy, fSize, fSize);

        // Geometric facets reflecting light
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
        
        ctx.beginPath();
        // Diagonal cut
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + fSize, fy + fSize);
        // Off-center cut based on divine signature (seed)
        const mx = fx + (s % fSize);
        const my = fy + ((s * 3) % fSize);
        ctx.moveTo(fx + fSize, fy);
        ctx.lineTo(mx, my);
        ctx.lineTo(fx, fy + fSize);
        ctx.stroke();

        // Gleam of Ohr (Light)
        if (s % 5 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(mx, my, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fff';
        }
    }
}
