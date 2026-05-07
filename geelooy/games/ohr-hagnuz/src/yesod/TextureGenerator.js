
/**
 * B"H
 * @class TextureGenerator
 * @chapter The Garments of Light
 * @description
 * Every blade of grass is spoken into existence.
 * We use the tile's coordinates as a "Divine Signature" (seed) 
 * to ensure that the procedural patterns are consistent yet organic.
 */
export class TextureGenerator {
    
    /**
     * @description Paints multi-layered, dimensional grass.
     */
    static drawGrass(ctx, x, y, size, seed, isDetailed) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1; // Crush the anti-aliasing seams
        const s = Math.abs(seed);

        // Level 1: Soil Base
        ctx.fillStyle = '#1b4d3e'; 
        ctx.fillRect(fx, fy, fSize, fSize);

        // Level 2: Organic Clumps
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#2e7d32';
        for (let i = 0; i < 3; i++) {
            const rx = fx + ((s * (i + 1) * 3) % size);
            const ry = fy + ((s * (i + 1) * 7) % size);
            ctx.beginPath();
            ctx.arc(rx, ry, size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Level 3: Individual Blades (V-Tufts)
        const numTufts = isDetailed ? 12 : 5;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        
        for (let t = 0; t < numTufts; t++) {
            const tx = fx + ((s * t * 13) % (size - 10)) + 5;
            const ty = fy + ((s * t * 19) % (size - 10)) + 5;
            
            const numBlades = 2 + (t % 2);
            for (let b = 0; b < numBlades; b++) {
                const angle = (b - 0.5) * 0.5;
                const h = 6 + (t % 6);
                ctx.strokeStyle = (t % 2 === 0) ? '#43a047' : '#2e7d32';
                ctx.beginPath();
                ctx.moveTo(tx, ty);
                ctx.lineTo(tx + Math.sin(angle) * h, ty - h);
                ctx.stroke();
            }
        }
    }

    /**
     * @description Paints layered sand dunes.
     */
    static drawSand(ctx, x, y, size, seed) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1;
        const s = Math.abs(seed);

        // Deep Base
        ctx.fillStyle = '#d4a355';
        ctx.fillRect(fx, fy, fSize, fSize);
        
        // Rolling Dunes
        ctx.fillStyle = '#e6c280';
        const dunes = 2 + (s % 2);
        for(let i = 0; i < dunes; i++) {
            const startY = fy + (size / dunes) * i + (s % 10);
            ctx.beginPath();
            ctx.moveTo(fx, startY);
            ctx.quadraticCurveTo(fx + size/2, startY - 15, fx + fSize, startY + 5);
            ctx.lineTo(fx + fSize, fy + fSize);
            ctx.lineTo(fx, fy + fSize);
            ctx.fill();
            
            // Dune Highlight
            ctx.strokeStyle = '#f3d599';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
}
