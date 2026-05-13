/**
 * B"H
 * @file MadreigaSystem.js
 * @description
 * 📈 THE LADDER OF ASCENT 📈
 * 
 * Chapter 13: The Madreiga (Level) of the Soul.
 * "They shall go from strength to strength" (Tehillim 84:8)
 * 
 * Manages the Chossid's experience points (Koach) and levels (Madreiga).
 * Higher Madreigas unlock deeper Torah study (Sod) and new book categories.
 */

export default class MadreigaSystem {
    constructor(chossid) {
        this.chossid = chossid;
        this.madreiga = 1;
        this.koach = 0; // XP
        this.koachToNext = 1000;
    }

    /**
     * B"H: Gain spiritual power.
     * @param {number} amount 
     */
    gainXP(amount) {
        this.koach += amount;
        
        if (this.koach >= this.koachToNext) {
            this.levelUp();
        }
    }

    levelUp() {
        this.madreiga++;
        this.koach -= this.koachToNext;
        this.koachToNext = Math.floor(this.koachToNext * 1.5);

        // B"H: Recalculate stats for the new level
        if (this.chossid.recalculateStats) {
            this.chossid.baseStats.health += 20;
            this.chossid.baseStats.attack += 5;
            this.chossid.baseStats.defense += 5;
            this.chossid.recalculateStats();
        }

        if (this.chossid.olam) {
            this.chossid.olam.ayshPeula("ui event", "toast", { 
                message: `B"H! You have ascended to Madreiga ${this.madreiga}!`,
                type: "success"
            });
        }
    }

    /**
     * B"H: Check if a certain level of study is allowed.
     */
    canStudyLevel(levelIdx) {
        // Pshat (0), Remez (1) always allowed
        // Drush (2) needs Madreiga 3
        // Sod (3) needs Madreiga 5
        if (levelIdx === 2 && this.madreiga < 3) return false;
        if (levelIdx === 3 && this.madreiga < 5) return false;
        return true;
    }
}
