
/**
 * B"H
 * @class FacadeWeaver
 */
export class FacadeWeaver {
    /**
     * @description Draws a front-facing brick wall.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} size - Tile dimension
     * @param {Object} palette - Base and alt colors
     * @param {number} seed - Unique tile signature
     */
    static draw(ctx, size, palette, seed) {
        // Base Foundation
        ctx.fillStyle = palette.base;
        ctx.fillRect(0, 0, size, size);

        // Brick Jitter
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = palette.alt;
        for(let i=0; i<3; i++) {
            const bx = (seed * i * 7) % size;
            const by = (seed * i * 13) % size;
            ctx.fillRect(bx, by, size/2, size/3);
        }
        ctx.globalAlpha = 1.0;

        // Mortar Lines (The Boundaries of Form)
        ctx.strokeStyle = palette.alt;
        ctx.lineWidth = 1;
        const bW = size / 3;
        const bH = size / 4;
        for (let r = 0; r < 4; r++) {
            const offset = (r % 2 === 0) ? bW / 2 : 0;
            for (let c = -1; c < 4; c++) {
                ctx.strokeRect(c * bW + offset, r * bH, bW, bH);
            }
        }
    }
}
