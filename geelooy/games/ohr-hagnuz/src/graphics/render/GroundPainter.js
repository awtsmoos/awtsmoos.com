
import { GrassPainter } from './ground/GrassPainter.js';
import { SandPainter } from './ground/SandPainter.js';
import { WaterPainter } from './ground/WaterPainter.js';
import { SnowPainter } from './ground/SnowPainter.js';
import { MountainPainter } from './ground/MountainPainter.js';
import { CrystalPainter } from './ground/CrystalPainter.js';
import { LavaPainter } from './ground/LavaPainter.js';
import { VoidPainter } from './ground/VoidPainter.js';
import { ParchmentPainter } from './ground/ParchmentPainter.js';
import { OhrPainter } from './ground/OhrPainter.js';

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
            '^': () => MountainPainter.draw(ctx, x, y, size, seed),
            '✧': () => CrystalPainter.draw(ctx, x, y, size, seed),
            '☁': () => {
                ctx.fillStyle = '#ffffff'; 
                ctx.globalAlpha = 0.6;
                ctx.beginPath(); ctx.arc(x + size/2, y + size/2, size/1.5, 0, Math.PI*2); ctx.fill();
                ctx.globalAlpha = 1.0;
            },
            '✨': () => {
                CrystalPainter.draw(ctx, x, y, size, seed); 
                ctx.fillStyle = '#ffeb3b';
                ctx.shadowBlur = 15; ctx.shadowColor = '#fff';
                ctx.beginPath(); ctx.arc(x + size/2, y + size/2, 4, 0, Math.PI*2); ctx.fill();
                ctx.shadowBlur = 0;
            },
            '☰': () => ParchmentPainter.draw(ctx, x, y, size, seed),
            '☼': () => OhrPainter.draw(ctx, x, y, size, seed),
            '♨': () => LavaPainter.draw(ctx, x, y, size, seed),
            '⬣': () => VoidPainter.draw(ctx, x, y, size, seed),
            '≈': () => {
                WaterPainter.draw(ctx, x, y, size, seed);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(x, y, size, size);
                if (seed % 3 === 0) {
                    ctx.fillStyle = '#fff';
                    ctx.beginPath(); ctx.arc(x + size/2, y + size/2, 2, 0, Math.PI*2); ctx.fill();
                }
            }
        };

        const drawFn = Routers[char] || Routers['1'];
        drawFn();
    }
}
