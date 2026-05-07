
import { KineticSoul } from './human/logic/KineticSoul.js';
import { ArmWeaver } from './human/parts/ArmWeaver.js';
import { HeadWeaver } from './human/parts/HeadWeaver.js';
import { TorsoWeaver } from './human/parts/TorsoWeaver.js';
import { LegWeaver } from './human/parts/LegWeaver.js';

/**
 * B"H
 * @class HumanGenerator
 * @chapter The Mirror of the Infinite
 * @description
 * This master orchestrator binds the modular weavers into a single 
 * human visage (Partzuf). By processing limbs in a specific order, 
 * it ensures perfect visual layering.
 */
export class HumanGenerator {
    /**
     * @description Materializes the full humanoid shape.
     */
    static draw(ctx, x, y, size, progress, dir, forceColor = null) {
        ctx.save();
        ctx.translate(x + size / 2, y + size / 2);

        // 1. HEARTBEAT OF THE STEP
        const pulse = KineticSoul.calculate(progress, size);
        ctx.translate(0, -pulse.bob);

        // 2. THE PATHWAY (Legs)
        LegWeaver.weave(ctx, size, pulse.swing, dir);

        // --- THE ARMS (Opposition of Phases) ---
        // We use mirrored swings (swing and -swing) to ensure 
        // that both arms appear and move in sync with the gait.
        
        // 3. LEFT ARM (Gevurah)
        const leftPhase = (dir === 'd' || dir === 'l') ? -pulse.swing : pulse.swing;
        ArmWeaver.weave(ctx, size, leftPhase, dir, true, forceColor);

        // 4. THE HEART (Torso)
        TorsoWeaver.weave(ctx, size, dir, forceColor);

        // 5. RIGHT ARM (Chesed)
        const rightPhase = (dir === 'd' || dir === 'l') ? pulse.swing : -pulse.swing;
        ArmWeaver.weave(ctx, size, rightPhase, dir, false, forceColor);

        // 6. THE CROWN (Head)
        HeadWeaver.weave(ctx, size, dir);

        ctx.restore();
    }
}
