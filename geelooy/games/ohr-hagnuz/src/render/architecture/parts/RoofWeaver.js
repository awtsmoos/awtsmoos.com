
/**
 * B"H
 * @class RoofWeaver
 */
export class RoofWeaver {
    /**
     * @description Draws a shingled roof surface.
     */
    static draw(ctx, size, palette) {
        // Rich Wood/Gold Base
        ctx.fillStyle = palette.roof;
        ctx.fillRect(0, 0, size, size);

        // Shingle Arcs
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 2;
        const sW = size / 3;
        const sH = size / 4;
        
        for (let r = 0; r < 4; r++) {
            // Alternate horizontal offset for natural layering
            const offset = (r % 2 === 0) ? sW / 2 : 0;
            for (let c = 0; c < 4; c++) {
                ctx.beginPath();
                // Arc represents the curved shingle
                ctx.arc(c * sW + offset, r * sH, sW / 1.4, 0, Math.PI);
                ctx.stroke();
            }
        }
        
        // Edge Shadow (Overhang)
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, size - 4, size, 4);
    }
}
