
import { HumanGenerator } from '../../../render/HumanGenerator.js';
import { WorldMapAssembler } from '../../../data/WorldMapAssembler.js';
import { StateRegister } from '../../../binah/StateRegister.js';

/**
 * B"H
 * @class ReflectionWeaver
 * @chapter As Above, So Below
 * @description
 * Water (Mayim) represents the fluidity of Chochmah and Remez. It acts as a mirror.
 * "As water reflects a face back to a face, so one's heart is reflected back to him." (Proverbs 27:19).
 * 
 * If the Tzaddik stands adjacent to water, this class weaves a distorted, 
 * inverted projection of their form into the depths.
 */
export class ReflectionWeaver {
    /**
     * @description Draws reflections for any entity near water.
     */
    static draw(ctx, entityList, camX, camY, RES) {
        const registry = WorldMapAssembler.WorldRegistry;

        entityList.forEach(item => {
            if (item.type !== 'HERO' && item.type !== 'NPC') return;

            // Find grid coordinate of the entity
            const gridX = Math.floor((item.x + camX + RES/2) / RES);
            const gridY = Math.floor((item.y + camY + RES) / RES); // Base of feet

            // Check if tile below the feet is water
            const tileBelow = registry.find(t => t.x === gridX && t.y === gridY + 1);
            if (tileBelow && tileBelow.char === '~') {
                this._weaveReflection(ctx, item, RES);
            }
        });
    }

    static _weaveReflection(ctx, item, RES) {
        ctx.save();
        
        // Translate to the feet of the entity
        ctx.translate(item.x, item.y + RES);
        
        // Invert Y axis for reflection
        ctx.scale(1, -1);
        
        // Apply water distortion
        const time = performance.now();
        const wave = Math.sin(time * 0.005 + item.x) * 4;
        ctx.transform(1, 0, Math.sin(time * 0.002) * 0.2, 1, wave, 0);

        // Apply ghostly blue tint
        ctx.globalAlpha = 0.3;
        ctx.filter = 'sepia(1) hue-rotate(180deg) saturate(3) blur(1px)';

        // Draw the entity (inverted)
        if (item.type === 'HERO') {
            HumanGenerator.draw(ctx, 0, -RES, RES, item.progress, item.dir);
        } else if (item.type === 'NPC') {
            HumanGenerator.draw(ctx, 0, -RES, RES, 0, item.dir, item.color);
        }

        ctx.restore();
    }
}
