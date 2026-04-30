
/**
 * B"H
 * @module ActionGenerator
 * @description
 * Chapter 45: The Branching Paths of Potential
 * "I have set before you life and good..." (Devarim 30:15)
 * 
 * This module analyzes a physical spark and determines how the soul may 
 * interact with it. It generates a list of sacred decrees (actions).
 */

export default class ActionGenerator {
    /**
     * @function generate
     * @param {Object} item - The enriched item data.
     * @param {Object} context - Metadata about where the item is (index, source).
     * @returns {Array} List of actions with text, color, and payload.
     */
    static generate(item, context) {
        if (!item) return [];

        const actions = [];
        const { index, sourceType } = context;

        // 1. EQUIPPING (Clothes and Garments)
        if (item.className === 'Apparel' || item.equipSlot && item.equipSlot !== 'rightHand') {
            const target = item.equipSlot || 'jacket';
            actions.push({
                text: item.isEquipped ? "REMOVE / UNEQUIP" : "WEAR / EQUIP",
                color: "#ff00ea",
                payload: item.isEquipped ? 
                    { unequipItem: item.equippedIn } : 
                    { equipItem: { sourceType, index, target } }
            });
        }

        // 2. ACTIVATING (Tools and Building Materials)
        if (item.isTool || item.isBuildable || item.isPainter) {
            const isHolding = item.isEquipped && item.equippedIn === 'rightHand';
            actions.push({
                text: isHolding ? "STOP USING" : "USE / MAKE ACTIVE",
                color: "#00ffed",
                payload: isHolding ?
                    { unequipItem: 'rightHand' } :
                    { equipItem: { sourceType, index, target: 'rightHand' } }
            });
        }

        // 3. EXPLORING (Containers)
        if (item.isContainer) {
            actions.push({
                text: "LOOK INSIDE",
                color: "#FFD700",
                payload: { openContainer: { item, index, sourceType } }
            });
        }

        // 4. THE VOID (Always available)
        actions.push({
            text: "DROP FOCUS",
            color: "#ff4757",
            payload: null // Triggers a menu close only
        });

        return actions;
    }
}
