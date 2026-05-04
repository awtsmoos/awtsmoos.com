
/**
 * B"H
 * @module Equipper
 * @description
 * "He has clothed me with garments of salvation..." (Yeshayahu 61:10)
 * Manages the equipping and unequipping of items onto the player's physical avatar.
 */
export default class Equipper {
    static equip(inventory, { sourceType, index, target }) {
        const array = inventory.getSourceArray(sourceType);
        if (!array || !array[index]) {
            console.warn(`B"H - ⚠️ [EQUIPPER]: Cannot equip — no item at ${sourceType}[${index}]`);
            return;
        }
        
        const item = array[index];
        // B"H: Intercept buildable items to enter Placement Mode instead of equipping
        if (item.type === 'brick' || item.type === 'furniture' || item.type === 'tree' || item.type === 'resource') {
            // B"H: silent

            if (inventory.owner.olam && inventory.owner.olam.placementManager) {
                // Pass the full item data
                inventory.owner.olam.placementManager.startPlacement(item);
            }
            return;
        }

        // B"H: silent

        inventory.equipment[target] = { sourceType, index };
        if (inventory.owner.updateAppearance) inventory.owner.updateAppearance();
        inventory.updateUI();
        inventory.save();
        // B"H: silent

    }

    static unequip(inventory, slotName) {
        if (!inventory.equipment[slotName]) {
            console.warn(`B"H - ⚠️ [EQUIPPER]: Cannot unequip — slot "${slotName}" is empty. Available: ${Object.keys(inventory.equipment).join(', ')}`);
            return;
        }
        // B"H: silent

        inventory.equipment[slotName] = null;
        if (inventory.owner.updateAppearance) inventory.owner.updateAppearance();
        inventory.updateUI();
        inventory.save();
        // B"H: silent

    }
}

