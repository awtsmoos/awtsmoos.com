
import { StateRegister } from '../binah/StateRegister.js';

/**
 * B"H
 * @chapter The Rhythm of the Soul (Kav HaMidah)
 * @description
 * This class translates the physical progress of a step into 
 * the logical frame of an animation. Our High-Res Gaits 
 * use 6 frames per 64-pixel stride.
 * 
 * We ensure that when the Hero is at rest, they face the 
 * chosen direction in 'Frame 1' (The Idle Pillar).
 */
export class AnimationDirector {
    /**
     * @param {string} direction - 'u', 'd', 'l', 'r'
     * @param {boolean} isMoving - Is the hero active?
     * @param {number} progress - 0 to 63
     */
    static resolveHeroFrame(direction, isMoving, progress) {
        const dStr = direction.toUpperCase();
        
        if (!isMoving) {
            return `HERO_${dStr}_F1`;
        }

        const framesInCycle = 6;
        const resolution = StateRegister.Resolution || 64;
        
        // Map 0-63 progress to 1-6 index
        const frameIndex = Math.floor((progress / resolution) * framesInCycle) + 1;
        const finalIdx = Math.min(Math.max(frameIndex, 1), framesInCycle);
        
        return `HERO_${dStr}_F${finalIdx}`;
    }
}
