
/**
 * B"H
 * @class SnowPainter
 */
export class SnowPainter {
    static draw(ctx, x, y, size, seed) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1;

        ctx.fillStyle = '#f5f5f5'; 
        ctx.fillRect(fx, fy, fSize, fSize);
        
        ctx.fillStyle = '#e0e0e0';
        for (let i = 0; i < 3; i++) {
            const px = fx + (Math.abs(seed * i * 7) % size);
            const py = fy + (Math.abs(seed * i * 11) % size);
            ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI*2); ctx.fill();
        }
    }
}
