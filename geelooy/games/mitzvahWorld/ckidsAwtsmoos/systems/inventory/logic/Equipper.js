
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
        if (!array || !array[index]) return;
        
        inventory.equipment[target] = { sourceType, index };
        if (inventory.owner.updateAppearance) inventory.owner.updateAppearance();
        inventory.updateUI();
        inventory.save();
    }

    static unequip(inventory, slotName) {
        if (!inventory.equipment[slotName]) return;
        inventory.equipment[slotName] = null;
        if (inventory.owner.updateAppearance) inventory.owner.updateAppearance();
        inventory.updateUI();
        inventory.save();
    }
}
