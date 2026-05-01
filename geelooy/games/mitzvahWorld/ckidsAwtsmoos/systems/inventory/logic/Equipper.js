
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
        
        console.log(`B"H - 👕 [EQUIPPER]: Equipping ${sourceType}[${index}] → ${target}`);
        inventory.equipment[target] = { sourceType, index };
        if (inventory.owner.updateAppearance) inventory.owner.updateAppearance();
        inventory.updateUI();
        inventory.save();
        console.log(`B"H - ✅ [EQUIPPER]: Equip complete. Calling updateUI().`);
    }

    static unequip(inventory, slotName) {
        if (!inventory.equipment[slotName]) {
            console.warn(`B"H - ⚠️ [EQUIPPER]: Cannot unequip — slot "${slotName}" is empty. Available: ${Object.keys(inventory.equipment).join(', ')}`);
            return;
        }
        console.log(`B"H - 👕 [EQUIPPER]: Unequipping slot "${slotName}"`);
        inventory.equipment[slotName] = null;
        if (inventory.owner.updateAppearance) inventory.owner.updateAppearance();
        inventory.updateUI();
        inventory.save();
        console.log(`B"H - ✅ [EQUIPPER]: Unequip complete. UI refresh triggered.`);
    }
}

