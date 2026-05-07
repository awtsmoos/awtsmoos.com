
import { StateRegistry } from '../binah/StateRegistry.js';
import { PortalValidator } from '../asiyah/PortalValidator.js';

/**
 * B"H
 * @class PhysicsValidator
 * @chapter The Constraints of Action
 * @description
 * Every movement must obey the laws of Asiyah. This class handles 
 * the interpolation of pixels and the final confirmation of a step.
 */
export class PhysicsValidator {
    /**
     * @description Resolves the current frame of kinetic arousal.
     */
    static resolve() {
        const HR = StateRegistry.HeroPos;
        if (!HR.moving) return;

        const RES = StateRegistry.Resolution;
        const speed = 4 * StateRegistry.GameSpeedMultiplier;

        // Kinetic Shifts
        if (HR.dir === 'u') HR.dy -= speed;
        if (HR.dir === 'd') HR.dy += speed;
        if (HR.dir === 'l') HR.dx -= speed;
        if (HR.dir === 'r') HR.dx += speed;

        HR.stepTick += speed;

        // Step Completion (The moment of landing)
        if (HR.stepTick >= RES) {
            HR.moving = false;
            HR.stepTick = 0;
            
            // Snap to grid to prevent alignment drift
            HR.dx = HR.cx * RES;
            HR.dy = HR.cy * RES;
            
            // Check for unique portals at the end of every step
            PortalValidator.check();
        }
    }
}
