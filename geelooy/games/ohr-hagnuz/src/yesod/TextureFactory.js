
/**
 * B"H
 * @class TextureFactory
 * @chapter The Foundation of Form (Yesod)
 * @description
 * Yesod connects the spiritual intentions of Binah to the physical kingdom 
 * of Malchus. Here, we weave procedural textures that aren't just colors, 
 * but layered fractal patterns. Every blade of grass and grain of sand 
 * is generated from the tile's unique divine signature (seed).
 */
export class TextureFactory {
    
    /**
     * @description Paints a layered procedural grass field.
     */
    static drawGrass(ctx, x, y, size, seed, isDetailed) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1; // Crush the anti-aliasing gaps
        const s = Math.abs(seed);

        // Level 1: Deep Root Base
        ctx.fillStyle = '#1b4d3e'; 
        ctx.fillRect(fx, fy, fSize, fSize);

        // Level 2: Organic Mid-Tones
        ctx.globalAlpha = 0.4;
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = (i % 2 === 0) ? '#2e7d32' : '#1b5e20';
            const rx = fx + ((s * (i + 1) * 3) % size);
            const ry = fy + ((s * (i + 1) * 7) % size);
            ctx.fillRect(rx, ry, size / 2, size / 2);
        }
        ctx.globalAlpha = 1.0;

        // Level 3: Individual Blades (Fractal Tufts)
        const tuftCount = isDetailed ? 15 : 6;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        
        for (let t = 0; t < tuftCount; t++) {
            const tx = fx + ((s * t * 13) % (size - 10)) + 5;
            const ty = fy + ((s * t * 19) % (size - 10)) + 5;
            this._drawTuft(ctx, tx, ty, s + t);
        }
    }

    /**
     * @description Paints wind-swept sand with layered dunes.
     */
    static drawSand(ctx, x, y, size, seed) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1;
        const s = Math.abs(seed);

        // Level 1: Golden Base
        ctx.fillStyle = '#d4a355';
        ctx.fillRect(fx, fy, fSize, fSize);
        
        // Level 2: Wind-Swept Ridges
        ctx.fillStyle = '#e6c280';
        const numDunes = 2 + (s % 3);
        for(let i = 0; i < numDunes; i++) {
            const startY = fy + (size / numDunes) * i + (s % 10);
            const ctrlY = startY - 15 - (s % 10);
            const endY = startY + 5;
            
            ctx.beginPath();
            ctx.moveTo(fx, startY);
            ctx.quadraticCurveTo(fx + size/2, ctrlY, fx + fSize, endY);
            ctx.lineTo(fx + fSize, fy + fSize);
            ctx.lineTo(fx, fy + fSize);
            ctx.closePath();
            ctx.fill();
            
            // Dune Peak Highlight
            ctx.strokeStyle = '#f3d599';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(fx, startY);
            ctx.quadraticCurveTo(fx + size/2, ctrlY, fx + fSize, endY);
            ctx.stroke();
        }
    }

    /**
     * @description Draws a specific clump of grass blades.
     * @private
     */
    static _drawTuft(ctx, x, y, seed) {
        const numBlades = 2 + (seed % 3);
        const h = 5 + (seed % 6);
        
        for (let i = 0; i < numBlades; i++) {
            const angle = (i - (numBlades / 2)) * 0.4;
            const bh = h + (i * 2);
            ctx.strokeStyle = (seed % 2 === 0) ? '#43a047' : '#2e7d32';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.sin(angle) * bh, y - bh);
            ctx.stroke();
        }
    }
}
