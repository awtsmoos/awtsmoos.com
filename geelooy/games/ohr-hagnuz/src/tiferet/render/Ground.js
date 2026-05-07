
/**
 * B"H
 * @class Ground
 * @chapter The Garments of the Field
 */
export class Ground {
    static draw(ctx, x, y, size, char, seed) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fS = size + 1;
        const s = Math.abs(seed);

        if (char === '1' || char === '🌿') {
            this._drawGrass(ctx, fx, fy, fS, s, char === '🌿');
        } else if (char === '2' || ['⇧','⇩','⇦','⇨'].includes(char)) {
            this._drawPath(ctx, fx, fy, fS, s);
        } else if (char === '.' || char === ' ') {
            ctx.fillStyle = '#1b5e20'; // Base Forest Floor
            ctx.fillRect(fx, fy, fS, fS);
        }
    }

    static _drawGrass(ctx, x, y, size, s, detailed) {
        // LAYER 1: The Soil
        ctx.fillStyle = '#1b4d3e'; 
        ctx.fillRect(x, y, size, size);

        // LAYER 2: Texture Noise
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = (s % 2 === 0) ? '#2e7d32' : '#1b5e20';
        for(let i = 0; i < 4; i++) {
            const rx = x + ((s * i * 11) % size);
            const ry = y + ((s * i * 7) % size);
            ctx.fillRect(rx, ry, size/2, size/2);
        }
        ctx.globalAlpha = 1.0;

        // LAYER 3: Tufts
        const tufts = detailed ? 8 : 3;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        for(let t = 0; t < tufts; t++) {
            const tx = x + ((s * t * 13) % (size - 10)) + 5;
            const ty = y + ((s * t * 19) % (size - 10)) + 5;
            const h = 5 + (t % 5);
            ctx.strokeStyle = (t % 2 === 0) ? '#43a047' : '#2e7d32';
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx - 2, ty - h);
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx + 2, ty - h);
            ctx.stroke();
        }
    }

    static _drawPath(ctx, x, y, size, s) {
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(x, y, size, size);

        // --- THE GRAVEL (Procedural Sparks) ---
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        for (let i = 0; i < 8; i++) {
            const px = x + ((s * i * 3) % (size - 4));
            const py = y + ((s * i * 5) % (size - 4));
            ctx.fillRect(px, py, 2 + (i % 2), 2);
        }
        
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        for (let i = 0; i < 4; i++) {
            const px = x + ((s * i * 17) % (size - 4));
            const py = y + ((s * i * 23) % (size - 4));
            ctx.fillRect(px, py, 2, 2);
        }
    }
}
