
/**
 * B"H
 * @class PineWeaver
 */
export class PineWeaver {
    static draw(ctx, size, isSnow = false) {
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(-size/8, size/4, size/4, size/2);

        const color = isSnow ? '#e0f7fa' : '#004d40';
        ctx.fillStyle = color;
        for (let i = 0; i < 3; i++) {
            const width = size * (0.8 - (i * 0.2));
            const yOffset = size/4 - (i * size/3);
            ctx.beginPath();
            ctx.moveTo(-width/2, yOffset);
            ctx.lineTo(width/2, yOffset);
            ctx.lineTo(0, yOffset - size/1.5);
            ctx.fill();
            
            if(isSnow) {
                ctx.strokeStyle = '#b2ebf2';
                ctx.stroke();
            }
        }
    }
}
