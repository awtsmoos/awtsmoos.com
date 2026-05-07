
/**
 * B"H
 * @class HeadWeaver
 * @chapter The Head of the Year (Rosh)
 * @description
 * The head is the Keter, the uppermost point of the Sefirotic structure 
 * in the human form. It contains the eyes—the windows of Binah.
 */
export class HeadWeaver {
    /**
     * @description Materializes the cranium and facial features.
     */
    static weave(ctx, size, dir, skinColor) {
        ctx.save();
        
        const hr = size / 5;
        const hy = -size / 2.5;
        const isSide = dir === 'l' || dir === 'r';
        
        // Base Head
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        // Slightly offset head in side view for realism
        const hx = isSide ? (dir === 'l' ? -3 : 3) : 0;
        ctx.arc(hx, hy, hr, 0, Math.PI * 2);
        ctx.fill();

        // Kippah (The black velvet of nullification)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        const kw = isSide ? hr * 0.75 : hr * 0.85;
        ctx.ellipse(hx, hy - hr + 2, kw, hr * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (The perception of Truth)
        if (dir === 'd' || isSide) {
            ctx.fillStyle = '#000';
            const eyeSize = 2.5;
            if (!isSide) {
                // Front view: two eyes
                ctx.fillRect(-hr / 2, hy, eyeSize, eyeSize);
                ctx.fillRect(hr / 2 - eyeSize, hy, eyeSize, eyeSize);
            } else {
                // Side view: one eye looking forward
                const ex = hx + (dir === 'l' ? -hr / 1.5 : hr / 1.5 - eyeSize);
                ctx.fillRect(ex, hy, eyeSize, eyeSize);
            }
        }

        ctx.restore();
    }
}
