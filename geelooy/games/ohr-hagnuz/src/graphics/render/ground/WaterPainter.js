
/**
 * B"H
 * @class WaterPainter
 */
export class WaterPainter {
    static draw(ctx, x, y, size, seed) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1;

        ctx.fillStyle = '#0288d1';
        ctx.fillRect(fx, fy, fSize, fSize);
        
        ctx.strokeStyle = '#4fc3f7';
        ctx.lineWidth = 2;
        const waveOffset = (performance.now() / 500 + Math.abs(seed)) % size;
        ctx.beginPath();
        ctx.moveTo(fx, fy + waveOffset);
        ctx.quadraticCurveTo(fx + size/2, fy + waveOffset - 5, fx + size, fy + waveOffset);
        ctx.stroke();
    }
}
