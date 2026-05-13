
import { WorldMapAssembler } from '../../data/WorldMapAssembler.js';
import { FacadeWeaver } from './parts/FacadeWeaver.js';
import { RoofWeaver } from './parts/RoofWeaver.js';
import { ScrollWeaver } from './parts/ScrollWeaver.js';

/**
 * B"H
 * @class Director
 */
export class Director {
    static render(ctx, x, y, size, tile) {
        ctx.save();
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1; 
        const s = Math.abs(tile.x * 31 + tile.y * 17);

        ctx.translate(fx, fy);
        
        ctx.beginPath();
        ctx.rect(0, 0, fSize, fSize);
        ctx.clip();

        // Handle the pure intellectual walls of Beriah
        if (tile.material === 'SCROLL') {
            ScrollWeaver.draw(ctx, size, s);
            ctx.restore();
            return;
        }

        const registry = WorldMapAssembler.WorldRegistry;
        
        const isBuildingBelow = registry.some(t => 
            t.x === tile.x && 
            t.y === tile.y + 1 && 
            (t.t.startsWith('G_WALL') || t.isPortal)
        );

        const isDoorBelow = registry.some(t => 
            t.x === tile.x && 
            t.y === tile.y + 1 && 
            t.isPortal
        );

        const isMiddleHoriz = registry.some(t => t.x === tile.x - 1 && t.y === tile.y && t.t.startsWith('G_WALL')) &&
                              registry.some(t => t.x === tile.x + 1 && t.y === tile.y && t.t.startsWith('G_WALL'));

        const Palettes = {
            'STONE':  { base: '#d7ccc8', alt: '#bcaaa4', roof: '#5d4037' },
            'WOOD':   { base: '#8d6e63', alt: '#5d4037', roof: '#3e2723' },
            'MARBLE': { base: '#f5f5f5', alt: '#e0e0e0', roof: '#ffb300' }
        };

        const mat = Palettes[tile.material || 'STONE'];

        if (!isBuildingBelow) {
            const hasWindow = (isMiddleHoriz && !isDoorBelow) || isDoorBelow;
            FacadeWeaver.draw(ctx, size, mat, s, hasWindow);
        } else {
            RoofWeaver.draw(ctx, size, mat);
        }

        ctx.restore();
    }
}
