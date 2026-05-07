
import { OakWeaver } from '../graphics/render/flora/OakWeaver.js';
import { PineWeaver } from '../graphics/render/flora/PineWeaver.js';
import { CactusWeaver } from '../graphics/render/flora/CactusWeaver.js';
import { PalmWeaver } from '../graphics/render/flora/PalmWeaver.js';

/**
 * B"H
 * @class ProceduralEnvironment
 * @chapter The Breath of the Earth (Deshe)
 */
export class ProceduralEnvironment {
    
    static drawTree(ctx, x, y, size, type = 'OAK') {
        ctx.save();
        ctx.translate(x + size / 2, y + size / 2);

        const Weavers = {
            'CACTUS': () => CactusWeaver.draw(ctx, size),
            'PINE':   () => PineWeaver.draw(ctx, size, false),
            'SNOW':   () => PineWeaver.draw(ctx, size, true),
            'PALM':   () => PalmWeaver.draw(ctx, size),
            'GOLD':   () => OakWeaver.draw(ctx, size, '#ffb300', '#ffd54f', '#ffca28'),
            'OAK':    () => OakWeaver.draw(ctx, size, '#1b5e20', '#2e7d32', '#388e3c')
        };

        const drawFn = Weavers[type] || Weavers['OAK'];
        drawFn();

        ctx.restore();
    }

    /**
     * @description Tall Grass is now a volumetric entity with multiple levels of density.
     */
    static drawTallGrass(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        
        const seed = (x * 7 + y * 11) % 100;

        // Level 1: Deep inner darkness (The hidden void where sparks rest)
        ctx.fillStyle = 'rgba(10, 40, 15, 0.7)';
        ctx.beginPath();
        ctx.ellipse(size/2, size*0.7, size*0.4, size*0.25, 0, 0, Math.PI*2);
        ctx.fill();

        // Level 2: Mid-ground thick blades
        ctx.strokeStyle = '#1b5e20';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        for (let i = 0; i < 8; i++) {
            const startX = (size / 8) * i + (seed % 8);
            const startY = size * 0.9;
            const height = size * 0.6 + ((seed * i) % (size * 0.3));
            const lean = ((seed + i) % 3 === 0) ? -8 : 8;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(startX + lean, startY - height/2, startX + lean*2, startY - height);
            ctx.stroke();
        }

        // Level 3: Foreground bright highlights (The light escaping the Klipot)
        ctx.strokeStyle = '#4caf50';
        ctx.lineWidth = 2.5;
        
        for (let i = 0; i < 10; i++) {
            const startX = (size / 10) * i + ((seed*2) % 6);
            const startY = size * 0.95;
            const height = size * 0.5 + ((seed * i * 3) % (size * 0.4));
            const lean = ((seed + i) % 2 === 0) ? 6 : -6;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(startX + lean*1.5, startY - height/2, startX + lean, startY - height);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}
