
import { WorldMapAssembler } from '../../data/WorldMapAssembler.js';

/**
 * B"H
 * @class RoadPainter
 * @chapter The Derech HaMelech (King's Highway)
 * @description
 * Draws the earthen paths connecting the worlds. 
 * Evaluates edge positions to correctly apply seamless extensions into the Abyss.
 */
export class RoadPainter {
    static draw(ctx, x, y, size, tile, mockNeighbors = null) {
        ctx.save();
        
        // Ensure seamless geometric overlaps
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1; // +1 pixel to crush anti-aliasing gaps

        // Base Earthen Tone
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(fx, fy, fSize, fSize);

        // Texture Jitter
        ctx.fillStyle = '#795548';
        const seed = (tile.x * 17 + tile.y * 31);
        
        for (let i = 0; i < 5; i++) {
            const px = fx + (Math.abs(seed * i * 7) % size);
            const py = fy + (Math.abs(seed * i * 11) % size);
            const pSize = 4 + (Math.abs(seed) % 4);
            ctx.beginPath();
            ctx.roundRect(px, py, pSize, pSize, 2);
            ctx.fill();
        }

        const registry = WorldMapAssembler.WorldRegistry;
        
        // Identify Map Boundaries
        const isRightEdge = tile.x === 24;
        const isLeftEdge = tile.x === 0;
        const isTopEdge = tile.y === 0;
        const isBottomEdge = tile.y === 13;

        // If the tile is a portal on the edge, we MUST assume it connects outward,
        // otherwise a dark grass border is erroneously drawn across the middle of the road!
        const neighbors = {
            u: (mockNeighbors && mockNeighbors.u) || (isTopEdge && tile.isPortal) || registry.some(t => t.x === tile.x && t.y === tile.y - 1 && (t.t === 'G_DIRT_PATH' || t.isPortal)),
            d: (mockNeighbors && mockNeighbors.d) || (isBottomEdge && tile.isPortal) || registry.some(t => t.x === tile.x && t.y === tile.y + 1 && (t.t === 'G_DIRT_PATH' || t.isPortal)),
            l: (mockNeighbors && mockNeighbors.l) || (isLeftEdge && tile.isPortal) || registry.some(t => t.x === tile.x - 1 && t.y === tile.y && (t.t === 'G_DIRT_PATH' || t.isPortal)),
            r: (mockNeighbors && mockNeighbors.r) || (isRightEdge && tile.isPortal) || registry.some(t => t.x === tile.x + 1 && t.y === tile.y && (t.t === 'G_DIRT_PATH' || t.isPortal))
        };

        // Draw soft borders where the dirt meets the grass
        ctx.fillStyle = 'rgba(27, 94, 32, 0.4)'; // Grass overlap shadow
        const edgeThick = 4;

        if (!neighbors.u) ctx.fillRect(fx, fy, fSize, edgeThick);
        if (!neighbors.d) ctx.fillRect(fx, fy + size - edgeThick, fSize, edgeThick);
        if (!neighbors.l) ctx.fillRect(fx, fy, edgeThick, fSize);
        if (!neighbors.r) ctx.fillRect(fx + size - edgeThick, fy, edgeThick, fSize);

        ctx.restore();
    }
}
