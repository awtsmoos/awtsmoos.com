
/**
 * B"H
 * @class OhrPainter
 * @chapter The Simple Light (Ohr Pashut)
 * @description
 * In Atzilut, there are no shadows. The ground is a pulsating lattice of pure white and gold light.
 */
export class OhrPainter {
    static draw(ctx, x, y, size, seed) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1;
        const time = performance.now();
        const s = Math.abs(seed);

        // Blinding White Base
        ctx.fillStyle = '#ffffff'; 
        ctx.fillRect(fx, fy, fSize, fSize);

        // Golden pulses of emanation
        const pulse = Math.abs(Math.sin(time * 0.002 + s));
        ctx.fillStyle = `rgba(255, 213, 79, ${pulse * 0.4})`;
        ctx.fillRect(fx, fy, fSize, fSize);

        // Center spark
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 15 + (pulse * 10);
        ctx.shadowColor = '#ffd54f';
        ctx.beginPath();
        ctx.arc(fx + size/2, fy + size/2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}
