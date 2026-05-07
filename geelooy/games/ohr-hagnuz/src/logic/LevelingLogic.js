
import { StateRegister } from '../binah/StateRegister.js';

/**
 * B"H
 * @class LevelingLogic
 * @chapter The Ascension of the Soul (Ma'alah)
 * @description
 * "They go from strength to strength" (Psalms 84:8).
 * This logic manages the growth of the Tzaddik. As sparks are gathered, 
 * the capacity for Divine Light (HP) and logic increases.
 */
export class LevelingLogic {
    /**
     * @description Adds XP and handles vessel expansion.
     * @param {number} amount - Sparks release.
     * @returns {boolean} True if Level Up occurred.
     */
    static gainSparks(amount) {
        const S = StateRegister.HeroStats;
        S.xp += amount;
        
        if (S.xp >= S.xpNeeded) {
            this.expandVessel();
            return true;
        }
        return false;
    }

    static expandVessel() {
        const S = StateRegister.HeroStats;
        S.level += 1;
        S.xp -= S.xpNeeded;
        
        // The path becomes steeper as one ascends
        S.xpNeeded = Math.floor(S.xpNeeded * 1.6);
        
        // Increase capacity
        S.maxLight += 25;
        S.light = S.maxLight;
        
        console.log(`B"H - Level Up! New Spiritual Stature: ${S.level}`);
    }
}
