
import { StateRegister } from '../binah/StateRegister.js';

/**
 * B"H
 * @class LevelingLogic
 * @chapter The Ascension of the Soul (Ma'alah)
 * @description
 * "They go from strength to strength" (Psalms 84:8).
 * This logic manages the growth of the Tzaddik. We now factor in Tiferet for XP yields,
 * and grant Spark Points to construct the internal Sefirot.
 */
export class LevelingLogic {
    /**
     * @description Adds XP and handles vessel expansion.
     */
    static gainSparks(baseAmount) {
        const S = StateRegister.HeroStats;
        const E = StateRegister.EtzChaim;

        // Tiferet harmonizes the yield, giving +5% extra per level
        const multiplier = 1.0 + (E.TIFERET * 0.05);
        const finalAmount = Math.floor(baseAmount * multiplier);

        S.xp += finalAmount;
        
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
        
        // Grant Spark Points for the Tree of Life
        S.sparkPoints += 1;
        
        // Minor natural capacity increase
        S.maxLight += 5;
        S.light = S.maxLight;
        
        console.log(`B"H - Level Up! Stature: ${S.level}. Earned 1 Spark Point.`);
    }
}
