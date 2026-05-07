
/**
 * B"H
 * @class PalmWeaver
 */
export class PalmWeaver {
    static draw(ctx, size) {
        // Curved Trunk
        ctx.strokeStyle = '#795548';
        ctx.lineWidth = size / 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, size/2);
        ctx.quadraticCurveTo(-size/4, 0, 0, -size/2);
        ctx.stroke();

        // Fronds
        ctx.strokeStyle = '#388e3c';
        ctx.lineWidth = 3;
        const frondCount = 6;
        for (let i=0; i<frondCount; i++) {
            const angle = (Math.PI * 2 / frondCount) * i;
            ctx.beginPath();
            ctx.moveTo(0, -size/2);
            ctx.quadraticCurveTo(
                Math.cos(angle) * size * 0.8, 
                Math.sin(angle) * size * 0.8 - size/2, 
                Math.cos(angle) * size, 
                Math.sin(angle) * size
            );
            ctx.stroke();
        }
    }
}
