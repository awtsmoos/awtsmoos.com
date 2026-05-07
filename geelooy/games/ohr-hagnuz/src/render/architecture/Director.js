
import { WorldMapAssembler } from '../../data/WorldMapAssembler.js';
import { FacadeWeaver } from './parts/FacadeWeaver.js';
import { RoofWeaver } from './parts/RoofWeaver.js';

/**
 * B"H
 * @class Director
 * @chapter The Master Plan of Bezalel
 * @description
 * This module is the intelligence behind the building structures. 
 * It ensures that houses look like 3D entities by observing the 
 * physical context of each 'Wall' tile.
 */
export class Director {
    /**
     * @description Materializes a block based on its environmental connections.
     */
    static render(ctx, x, y, size, tile) {
        ctx.save();
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1; // Gap crushing
        const s = Math.abs(tile.x * 31 + tile.y * 17);

        ctx.translate(fx, fy);
        
        // Establish the Mechitzah (Clipping Boundary)
        ctx.beginPath();
        ctx.rect(0, 0, fSize, fSize);
        ctx.clip();

        const registry = WorldMapAssembler.WorldRegistry;
        
        // CONNECTED TEXTURE LOGIC:
        // If there's a wall or door below, this tile is a ROOF tile.
        const isBuildingBelow = registry.some(t => 
            t.x === tile.x && 
            t.y === tile.y + 1 && 
            (t.t === 'G_WALL_STONE' || t.isPortal)
        );

        const Palettes = {
            'STONE':  { base: '#d7ccc8', alt: '#bcaaa4', roof: '#5d4037' },
            'WOOD':   { base: '#8d6e63', alt: '#5d4037', roof: '#3e2723' },
            'MARBLE': { base: '#f5f5f5', alt: '#e0e0e0', roof: '#ffb300' }
        };

        const mat = Palettes[tile.material || 'STONE'];

        if (!isBuildingBelow) {
            FacadeWeaver.draw(ctx, size, mat, s);
        } else {
            RoofWeaver.draw(ctx, size, mat);
        }

        ctx.restore();
    }
}
