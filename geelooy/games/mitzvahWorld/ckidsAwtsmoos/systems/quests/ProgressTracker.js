
/**
 * @file ProgressTracker.js
 * @description
 * Chapter 44: THE BOOK OF REMEMBRANCE
 * 
 * "All your deeds are written in a book." (Pirkei Avot 2:1)
 * This logic handles the calculation of percentages and goal-checks
 * for a Shlichus. It compares the current "Yesh" (collected items) 
 * against the "Tawchlees" (total goal).
 */

export default class ProgressTracker {
    /**
     * @function check
     * @description Analyzes the current state of a quest to see if it is complete.
     * @param {Object} quest - The Shlichus instance.
     * @param {Object} inventory - The player's inventory reference.
     * @returns {boolean} True if all divine requirements are met.
     */
    static check(quest, inventory) {
        if (!quest || !inventory) return false;

        let requirementsMet = true;

        // 1. GATHER REQUIREMENTS (Check slots for specific sparks)
        if (quest.requirements && Object.keys(quest.requirements).length > 0) {
            for (const [id, qtyNeeded] of Object.entries(quest.requirements)) {
                const totalInInv = inventory.slots.reduce((acc, s) => {
                    if (s && (s.id.includes(id) || s.name === id)) return acc + (s.quantity || 1);
                    return acc;
                }, 0);

                if (totalInInv < qtyNeeded) requirementsMet = false;
            }
        }

        // 2. WORLD COLLECTION REQUIREMENTS
        if (quest.totalCollectedObjects > 0) {
            if (quest.collected < quest.totalCollectedObjects) {
                requirementsMet = false;
            }
        }

        // 3. MANUAL FLAGS (e.g. Talked to someone)
        if (quest.needsInteraction && !quest.interactionDone) {
            requirementsMet = false;
        }

        return requirementsMet;
    }
}
