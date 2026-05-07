
import { WorldMapAssembler } from '../../../data/WorldMapAssembler.js';

/**
 * B"H
 * @class RoadPainter
 * @chapter The King's Highway
 */
export class RoadPainter {
    /**
     * @description Materializes the earthen paths connecting the worlds.
     */
    static draw(ctx, x, y, size, tile, mockNeighbors = null) {
        ctx.save();
        
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1;
        // Use coordinates to generate a stable seed for jitter
        const s = Math.abs(tile.x * 13 + tile.y * 7);

        // --- LAYER 1: THE DUST ---
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(fx, fy, fSize, fSize);

        // --- LAYER 2: EROSION PATCHES ---
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#5d4037';
        for(let i=0; i<3; i++) {
            ctx.fillRect(fx + (s*i*11)%size, fy + (s*i*17)%size, size/2, size/2);
        }
        ctx.globalAlpha = 1.0;

        // --- LAYER 3: PEBBLES (Gravel) ---
        ctx.fillStyle = '#795548';
        const numPebbles = 4 + (s % 4);
        for (let i = 0; i < numPebbles; i++) {
            const px = fx + ((s * (i + 1) * 7) % (size - 4));
            const py = fy + ((s * (i + 1) * 3) % (size - 4));
            ctx.fillRect(px, py, 3, 2);
        }

        // --- LAYER 4: EDGE BLENDING ---
        this._blend(ctx, fx, fy, size, tile, mockNeighbors);

        ctx.restore();
    }

    static _blend(ctx, fx, fy, size, tile, mockNeighbors) {
        const registry = WorldMapAssembler.WorldRegistry;
        
        // Neighbors logic (including abyss road extensions)
        const n = mockNeighbors || {
            u: registry.some(t => t.x === tile.x &amp;&amp; t.y === tile.y - 1 &amp;&amp; (t.t === 'G_DIRT_PATH' || t.isPortal)),
            d: registry.some(t => t.x === tile.x &amp;&amp; t.y === tile.y + 1 &amp;&amp; (t.t === 'G_DIRT_PATH' || t.isPortal)),
            l: registry.some(t => t.x === tile.x - 1 &amp;&amp; t.y === tile.y &amp;&amp; (t.t === 'G_DIRT_PATH' || t.isPortal)),
            r: registry.some(t => t.x === tile.x + 1 &amp;&amp; t.y === tile.y &amp;&amp; (t.t === 'G_DIRT_PATH' || t.isPortal))
        };

        // Dark grass shadow at the edge of the path
        ctx.fillStyle = 'rgba(27, 94, 32, 0.35)'; 
        const edge = 6;
        if (!n.u) ctx.fillRect(fx, fy, size + 1, edge);
        if (!n.d) ctx.fillRect(fx, fy + size - edge, size + 1, edge);
        if (!n.l) ctx.fillRect(fx, fy, edge, size + 1);
        if (!n.r) ctx.fillRect(fx + size - edge, fy, edge, size + 1);
    }
}
