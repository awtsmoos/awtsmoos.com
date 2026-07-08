/**
 * B"H
 * @file StudyManager.js
 * @description
 * 📖 THE CHAMBER OF CONTEMPLATION 📖
 * 
 * Chapter 5: The Acquisition of Wisdom.
 * "A vessel for the Torah."
 * 
 * This system tracks the Chossid's progress in learning the 12 Pesukim.
 * It manages the PaRDeS levels (Pshat, Remez, Drush, Sod) and applies
 * the resulting soul-bonuses to the character's attributes.
 */

import { TORAH_LIBRARY } from '../tochen/torah/library/TorahLibrary.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class StudyManager {
    constructor(chossid) {
        this.chossid = chossid;
        this.learned = {}; // Map of pasukId -> currentLevel (0: None, 1: Pshat, 2: Remez, etc.)
        
        // Initialize with default Pshat for the first pasuk
        this.learned["torah_tziva"] = 1;
    }

    /**
     * B"H: Study a pasuk to reach the next level.
     * @param {string} pasukId 
     * @returns {Object} Result of the study session.
     */
    study(pasukId) {
        const pasuk = TORAH_LIBRARY[pasukId];
        if (!pasuk) return { success: false, message: "Pasuk not found in the manifest." };

        const currentLevelIdx = this.learned[pasukId] || 0;
        const levelKeys = Object.keys(pasuk.levels);
        
        if (currentLevelIdx >= levelKeys.length) {
            return { success: false, message: "You have reached the ultimate Sod of this pasuk!" };
        }

        const nextLevelKey = levelKeys[currentLevelIdx];
        const nextLevel = pasuk.levels[nextLevelKey];

        // B"H: Check Madreiga restrictions
        if (!this.chossid.madreigaSystem.canStudyLevel(currentLevelIdx)) {
            return { success: false, message: `Your Madreiga (${this.chossid.madreigaSystem.madreiga}) is too low to master the ${nextLevel.name} of this pasuk.` };
        }

        // B"H: Check for prerequisites (e.g. Perutahs or Study Points)
        if (this.chossid.perutahs < (nextLevel.unlockCost || 0)) {
            return { success: false, message: `You need ${nextLevel.unlockCost} Perutahs to acquire the depth of ${nextLevel.name}.` };
        }

        // B"H: Perform the study
        this.chossid.perutahs -= (nextLevel.unlockCost || 0);
        this.learned[pasukId] = currentLevelIdx + 1;

        // Apply bonuses
        this.applyBonuses();

        return { 
            success: true, 
            message: `B"H! You have mastered the ${nextLevel.name} of "${pasuk.hebrew}".`,
            level: nextLevel.name,
            bonus: nextLevel.bonus
        };
    }

    /**
     * B"H: Calculate total bonuses from all learned pesukim.
     */
    getBonuses() {
        const totalBonuses = {
            chochmah: 0,
            binah: 0,
            daas: 0,
            defense: 0,
            attack: 0,
            health: 0,
            speed: 1,
            specials: []
        };

        for (const [id, levelIdx] of Object.entries(this.learned)) {
            const pasuk = TORAH_LIBRARY[id];
            const levelKeys = Object.keys(pasuk.levels);
            
            for (let i = 0; i < levelIdx; i++) {
                const levelData = pasuk.levels[levelKeys[i]];
                const b = levelData.bonus || {};
                
                if (b.chochmah) totalBonuses.chochmah += b.chochmah;
                if (b.binah) totalBonuses.binah += b.binah;
                if (b.daas) totalBonuses.daas += b.daas;
                if (b.defense) totalBonuses.defense += b.defense;
                if (b.attack) totalBonuses.attack += b.attack;
                if (b.health) totalBonuses.health += b.health;
                if (b.speed) totalBonuses.speed *= b.speed;
                if (b.special) totalBonuses.specials.push(b.special);
            }
        }

        return totalBonuses;
    }

    /**
     * B"H: Re-calculate and apply bonuses to the Chossid.
     */
    applyBonuses() {
        if (this.chossid.recalculateStats) {
            this.chossid.recalculateStats();
        }
    }
}
