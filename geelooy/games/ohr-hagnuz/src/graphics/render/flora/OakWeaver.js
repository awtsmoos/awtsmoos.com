
/**
 * B"H
 * @class OakWeaver
 */
export class OakWeaver {
    static draw(ctx, size, color1, color2, color3) {
        ctx.fillStyle = '#4e342e';
        const trunkW = size / 4;
        const trunkH = size / 2;
        ctx.fillRect(-trunkW / 2, size / 10, trunkW, trunkH);

        const layers = [
            { r: size * 0.7, c: color1, oy: -size / 4 },
            { r: size * 0.55, c: color2, oy: -size / 2 },
            { r: size * 0.4, c: color3, oy: -size * 0.75 }
        ];

        layers.forEach(l => {
            ctx.fillStyle = l.c;
            ctx.beginPath();
            ctx.arc(0, l.oy, l.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.stroke();
        });
    }
}
