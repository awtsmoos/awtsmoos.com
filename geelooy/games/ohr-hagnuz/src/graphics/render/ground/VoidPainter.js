
/**
 * B"H
 * @class VoidPainter
 * @chapter The Empty Space (Makom Panui)
 * @description
 * Before the Emanation, the Infinite Light filled all reality. To make room for creation, 
 * the Light contracted (Tzimtzum), leaving a 'Void'.
 * This painter renders that absolute, terrifying nothingness. It is darker than black.
 */
export class VoidPainter {
    static draw(ctx, x, y, size, seed) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1;
        const time = performance.now();
        const s = Math.abs(seed);

        // Absolute Darkness
        ctx.fillStyle = '#010103';
        ctx.fillRect(fx, fy, fSize, fSize);

        // Faint, shifting nebulae of potential
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#1a0033';
        
        ctx.beginPath();
        const wave = Math.sin(time * 0.0005 + (x * 0.01)) * size;
        ctx.arc(fx + size/2 + wave, fy + size/2, size * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Occasional distant, dying spark of the shattered worlds (Tohu)
        ctx.globalAlpha = 1.0;
        if (s % 30 === 0) {
            const glowPhase = Math.abs(Math.sin(time * 0.002 + s));
            ctx.fillStyle = `rgba(213, 0, 249, ${glowPhase})`;
            ctx.beginPath();
            ctx.arc(fx + (s % size), fy + ((s*3) % size), 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
