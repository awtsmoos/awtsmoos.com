
import { StateRegister } from '../binah/StateRegister.js';

/**
 * B"H
 * AnimationDirector: The weaver of the loom of time.
 * Calculates which aspect of the 6-frame cycle is visible.
 * This class coordinates the dance of pixels according to directional will.
 */
export class AnimationDirector {
    /** 
     * Resolves the string identifier for a high-res gait frame.
     * 
     * @param {string} direction - 'u', 'd', 'l', 'r'
     * @param {boolean} isMoving - Is the hero active in space?
     * @param {number} progress - Current pixel offset within tile (0 to 63)
     */
    static resolveHeroFrame(direction, isMoving, progress) {
        const dStr = direction.toUpperCase();
        
        if (!isMoving) {
            // Idle state defaults to Frame 1 (Static standing)
            return `HERO_${dStr}_F1`;
        }

        // Logic for 6 frames across a 64-pixel stride
        const framesInCycle = 6;
        const resolution = StateRegister.Resolution || 64;
        
        // Approximate 10.6 ticks per frame of human motion
        const ticksPerFrame = resolution / framesInCycle;
        let frameIndex = Math.floor(progress / ticksPerFrame) + 1;

        // Secure boundary against Tohu floating points
        const finalIdx = Math.min(Math.max(frameIndex, 1), framesInCycle);
        
        return `HERO_${dStr}_F${finalIdx}`;
    }
}
