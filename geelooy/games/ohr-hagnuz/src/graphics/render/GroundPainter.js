
import { GrassPainter } from './ground/GrassPainter.js';
import { SandPainter } from './ground/SandPainter.js';
import { WaterPainter } from './ground/WaterPainter.js';
import { SnowPainter } from './ground/SnowPainter.js';
import { MountainPainter } from './ground/MountainPainter.js';

/**
 * B"H
 * @class GroundPainter
 * @description
 * Pure router directing the Divine Will into specific physical ground textures.
 */
export class GroundPainter {
    static draw(ctx, x, y, size, tile) {
        const seed = (tile.x * 13 + tile.y * 7);
        const char = tile.char;
        
        const Routers = {
            '1': () => GrassPainter.draw(ctx, x, y, size, seed, false),
            '🌿': () => GrassPainter.draw(ctx, x, y, size, seed, true),
            '.': () => SandPainter.draw(ctx, x, y, size, seed),
            '~': () => WaterPainter.draw(ctx, x, y, size, seed),
            '*': () => SnowPainter.draw(ctx, x, y, size, seed),
            '^': () => MountainPainter.draw(ctx, x, y, size, seed)
        };

        const drawFn = Routers[char] || Routers['1'];
        drawFn();
    }
}
