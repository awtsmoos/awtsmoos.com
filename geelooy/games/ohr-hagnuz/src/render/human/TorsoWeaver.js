
/**
 * B"H
 * @class TorsoWeaver
 * @chapter The Beauty of the Body (Tiferet)
 */
export class TorsoWeaver {
    /**
     * @description Materializes the central vessel of the soul's garments.
     */
    static weave(ctx, size, dir, shirtColor) {
        ctx.save();
        
        const isSide = dir === 'l' || dir === 'r';
        const torsoW = isSide ? size / 3.2 : size / 2.1;
        const torsoH = size / 1.9;
        
        ctx.fillStyle = shirtColor;
        ctx.beginPath();
        // Centered vertically, offset horizontally for side views
        const tx = isSide ? (dir === 'l' ? 1 : -1) : 0;
        ctx.roundRect(-torsoW / 2 + tx, -size / 4, torsoW, torsoH, size / 12);
        ctx.fill();
        
        // Subtle shading on the edge
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        const sx = dir === 'l' ? -torsoW/2 : torsoW/2 - 4;
        ctx.fillRect(sx, -size/4 + 5, 4, torsoH - 10);

        ctx.restore();
    }
}
