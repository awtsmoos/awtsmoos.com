
/**
 * B"H
 * @class ParchmentPainter
 * @chapter The Floor of Intellect
 * @description
 * In Beriah, the very ground is made of the Torah.
 * This draws an off-white, textured parchment surface with faint, unreadable lines of text (Otiot).
 */
export class ParchmentPainter {
    static draw(ctx, x, y, size, seed) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1;
        const s = Math.abs(seed);

        // Base Parchment (Klaf)
        ctx.fillStyle = '#fff9c4'; 
        ctx.fillRect(fx, fy, fSize, fSize);

        // Weathering / Aging of the scroll
        ctx.fillStyle = 'rgba(141, 110, 99, 0.15)';
        ctx.fillRect(fx, fy, fSize, fSize);
        
        ctx.fillStyle = 'rgba(141, 110, 99, 0.3)';
        ctx.beginPath();
        ctx.arc(fx + (s % fSize), fy + ((s*3) % fSize), size/3, 0, Math.PI * 2);
        ctx.fill();

        // Faint lines of text (Sirtut)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for(let i=0; i<4; i++) {
            const lineY = fy + 10 + (i * 12);
            // Draw a dashed, imperfect line to simulate ancient script
            for(let j=0; j<5; j++) {
                const dashW = 4 + (s % 6);
                const dashX = fx + 5 + (j * 10) + ((s*j)%5);
                ctx.fillRect(dashX, lineY, dashW, 2);
            }
        }
    }
}
