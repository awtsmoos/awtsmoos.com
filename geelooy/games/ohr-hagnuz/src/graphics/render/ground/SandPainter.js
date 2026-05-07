
/**
 * B"H
 * @class SandPainter
 * @chapter The Shifting Dunes
 * @description
 * Creates multiple levels of wind-swept sand using flowing bezier curves 
 * and deep golden highlights.
 */
export class SandPainter {
    static draw(ctx, x, y, size, seed) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1; // Crush gaps

        // 1. Deepest Base Sand
        ctx.fillStyle = '#d4a355';
        ctx.fillRect(fx, fy, fSize, fSize);
        
        // 2. Wind-swept upper dune layers
        ctx.fillStyle = '#e6c280';
        const numDunes = 2 + (Math.abs(seed) % 2);
        
        for(let i=0; i<numDunes; i++) {
            const startY = fy + (size / numDunes) * i + (Math.abs(seed * i) % 15);
            const ctrlY = startY - 15 - (Math.abs(seed) % 10);
            const endY = startY + 5;
            
            ctx.beginPath();
            ctx.moveTo(fx, startY);
            ctx.quadraticCurveTo(fx + size/2, ctrlY, fx + fSize, endY);
            ctx.lineTo(fx + fSize, fy + fSize);
            ctx.lineTo(fx, fy + fSize);
            ctx.closePath();
            ctx.fill();
            
            // 3. Crisp Dune Ridge Highlight
            ctx.strokeStyle = '#f3d599';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(fx, startY);
            ctx.quadraticCurveTo(fx + size/2, ctrlY, fx + fSize, endY);
            ctx.stroke();
        }

        // 4. Scorch marks / pebbles in the sand
        ctx.fillStyle = '#c9a15a';
        for (let i = 0; i < 6; i++) {
            const px = fx + (Math.abs(seed * i * 3) % size);
            const py = fy + (Math.abs(seed * i * 5) % size);
            ctx.fillRect(px, py, 2, Math.abs(seed*i)%2 === 0 ? 2 : 1);
        }
    }
}
