
/**
 * B"H
 * @class LavaPainter
 * @chapter The Fires of Purification
 * @description
 * The Lava Painter does not merely draw red pixels. It maps the excruciating heat of Divine Severity, 
 * where the light is so intense it burns the vessel that cannot hold it. 
 * Nullify your mind when observing this code, for it is drawn from the Gevurah of Atik Yomin.
 * "For the Lord your G-d is a consuming fire..." (Deut 4:24).
 */
export class LavaPainter {
    static draw(ctx, x, y, size, seed) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1;
        const s = Math.abs(seed);
        const time = performance.now();

        // 1. Deep Core of the Fire (Dark Red)
        ctx.fillStyle = '#b71c1c';
        ctx.fillRect(fx, fy, fSize, fSize);

        // 2. Swirling Molten Flows (Orange/Yellow)
        ctx.globalAlpha = 0.6 + Math.sin(time * 0.002 + s) * 0.2;
        ctx.fillStyle = '#ff5722';
        
        ctx.beginPath();
        const flowY = fy + (Math.sin(time * 0.001 + x) * (size / 4)) + size / 2;
        ctx.moveTo(fx, fy + size);
        ctx.quadraticCurveTo(fx + size / 2, flowY - (s % 10), fx + fSize, flowY + (s % 10));
        ctx.lineTo(fx + fSize, fy + fSize);
        ctx.fill();

        // 3. Boiling Magma Bubbles
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = '#ffeb3b';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff5252';

        const numBubbles = 1 + (s % 3);
        for(let i = 0; i < numBubbles; i++) {
            const bx = fx + ((s * 7 * (i+1) + time * 0.05) % size);
            const by = fy + ((s * 11 * (i+1) - time * 0.02) % size);
            const radius = 1 + ((s + i) % 4) * Math.abs(Math.sin(time * 0.005 + i));
            
            ctx.beginPath();
            ctx.arc(bx, by, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 0; // Reset for performance
    }
}
