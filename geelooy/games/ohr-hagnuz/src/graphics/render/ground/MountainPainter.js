
/**
 * B"H
 * @class MountainPainter
 */
export class MountainPainter {
    static draw(ctx, x, y, size, seed) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1;

        ctx.fillStyle = '#5d4037'; 
        ctx.fillRect(fx, fy, fSize, fSize);
        
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2;
        const px = fx + (Math.abs(seed) % size);
        const py = fy + (Math.abs(seed * 2) % size);
        ctx.beginPath();
        ctx.moveTo(fx, fy + size);
        ctx.lineTo(px, py);
        ctx.lineTo(fx + size, fy + size);
        ctx.stroke();
    }
}
