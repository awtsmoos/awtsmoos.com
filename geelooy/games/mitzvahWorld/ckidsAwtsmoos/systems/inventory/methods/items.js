








/**
 * B"H
 * Item manipulation logic for InventoryManager
 */
import * as AWTSMOOS from "../../../awtsmoosCkidsGames.js";
import { CurrencySystem } from "../../../dvarim/coin.js";

export default {
    enrichItemData(itemData) {
        if (!itemData || !itemData.className) return itemData;
        
        // B"H: Preserve original icon if it exists
        const originalIcon = itemData.icon;
        
        const ItemClass = AWTSMOOS[itemData.className];
        if (ItemClass) {
            try {
                const tempInstance = new ItemClass({});
                
                if (itemData.sellValue === undefined) {
                    itemData.sellValue = tempInstance.sellValue || 0;
                }
                
                if (!itemData.name) itemData.name = ItemClass.itemName || tempInstance.name || itemData.className;
                if (!itemData.description) itemData.description = ItemClass.description || tempInstance.description || "";
                
                if (ItemClass.isBuildable) itemData.isBuildable = true;
            } catch (e) {
                console.warn("B\"H: Could not hydrate item class", itemData.className, e);
            }
        }
        
        // B"H: Logic to determine final icon
        // 1. If original item had an icon, keep it.
        // 2. If not, try class static icon.
        // 3. Fallback to empty.
        if (!itemData.icon) {
            if (originalIcon) itemData.icon = originalIcon;
            else if (ItemClass && ItemClass.icon) itemData.icon = ItemClass.icon;
            else itemData.icon = "";
        }
        
        if (itemData.className === 'Coin') {
             if(!itemData.value) itemData.value = 1;
             itemData.icon = CurrencySystem.getBase64Icon(itemData.value);
             itemData.name = CurrencySystem.NAMES[itemData.value];
        }

        // B"H: If item has custom color, flag it as tintable for the UI
        if (itemData.customData && itemData.customData.color) {
            itemData.isTintable = true;
        }

        // B"H: Ensure isContainer is preserved and checked against slots presence
        if (
            itemData.isContainer || 
            itemData.className === 'Container' || 
            (itemData.customData && itemData.customData.slots)
        ) {
            itemData.isContainer = true;
        }
        
        return itemData;
    },

    addItem(itemData, quantity = 1) {
        if (!itemData || !itemData.id || !itemData.className) return false;

        const enhancedItemData = this.enrichItemData({ ...itemData });
        const itemClass = AWTSMOOS[enhancedItemData.className];
        const maxStack = itemClass ? (itemClass.stackSize || 512) : 512;
        const uniqueItemId = enhancedItemData.id; 

        // Always add to main slots for now
        const targetSlots = this.slots;

        for (let i = 0; i < targetSlots.length; i++) {
            const slot = targetSlots[i];
            if (slot && slot.id === uniqueItemId && slot.quantity < maxStack) {
                const canAdd = maxStack - slot.quantity;
                const toAdd = Math.min(quantity, canAdd);
                slot.quantity += toAdd;
                quantity -= toAdd;
                if (quantity <= 0) { this.updateUI(); this.save(); return true; }
            }
        }

        for (let i = 0; i < targetSlots.length; i++) {
            if (targetSlots[i] === null) {
                const toAdd = Math.min(quantity, maxStack);
                targetSlots[i] = { ...enhancedItemData, quantity: toAdd };
                quantity -= toAdd;
                if (quantity <= 0) { this.updateUI(); this.save(); return true; }
            }
        }
        
        this.updateUI();
        return quantity > 0 ? false : true;
    },

    updateItem(sourceType, index, newItemData) {
        let sourceArray;
        if (sourceType === 'container') {
            sourceArray = this.activeContainer ? this.activeContainer.customData.slots : null;
        } else {
            sourceArray = sourceType === 'action' ? this.actionSlots : this.slots;
        }
        
        if (!sourceArray || index < 0 || index >= sourceArray.length) return;
        const existingItem = sourceArray[index];
        if (!existingItem) return;
        
        const updatedItem = this.enrichItemData({ ...existingItem, ...newItemData });
        
        sourceArray[index] = updatedItem;
        this.updateUI();
        this.save();
    },

    hydrateItems() {
        this.slots = this.slots.map(item => item ? this.enrichItemData(item) : null);
        this.actionSlots = this.actionSlots.map(item => item ? this.enrichItemData(item) : null);
    },

    consumeItem(itemReference, amount = 1) {
        if (!itemReference) return;
        itemReference.quantity -= amount;
        if (itemReference.quantity <= 0) {
            let slotIndex = this.slots.indexOf(itemReference);
            if (slotIndex > -1) {
                this.slots[slotIndex] = null;
            } else {
                let actionIndex = this.actionSlots.indexOf(itemReference);
                if (actionIndex > -1) {
                    this.actionSlots[actionIndex] = null;
                } else {
                    for (const [key, equippedRef] of Object.entries(this.equipment)) {
                        if (equippedRef) {
                            const source = equippedRef.sourceType === 'action' ? this.actionSlots : this.slots;
                            if (source[equippedRef.index] === itemReference) {
                                this.equipment[key] = null;
                                this.updateVisuals(key, itemReference, false);
                                break;
                            }
                        }
                    }
                }
            }
            this.owner.updateHandState();
        }
        this.updateUI();
        this.save();
    },

    removeItem(slotIndex, quantity = 1) {
        const slot = this.slots[slotIndex];
        if (slot) {
            slot.quantity -= quantity;
            if (slot.quantity <= 0) this.slots[slotIndex] = null;
            this.updateUI();
            this.save();
            return true;
        }
        return false;
    },

    getWalletValue() {
        let total = 0;
        const countSlot = (slot) => {
            if (slot && slot.className === 'Coin') {
                const val = slot.value || 1;
                total += val * slot.quantity;
            }
        };
        this.slots.forEach(countSlot);
        this.actionSlots.forEach(countSlot);
        return total;
    },

    deductCurrency(amount) {
        const currentTotal = this.getWalletValue();
        if (currentTotal < amount) return false;

        const newTotal = currentTotal - amount;
        const clearSlot = (slot, index, array) => {
            if (slot && slot.className === 'Coin') array[index] = null;
        };
        this.slots.forEach(clearSlot);
        this.actionSlots.forEach(clearSlot);

        const change = CurrencySystem.convert(newTotal);
        for (const [type, count] of Object.entries(change)) {
            const val = CurrencySystem.VALUES[type];
            this.addItem({
                id: 'coin_' + val + '_' + Date.now(),
                className: 'Coin',
                name: CurrencySystem.NAMES[val],
                value: val,
                quantity: count,
                icon: CurrencySystem.getBase64Icon(val),
                description: `Value: ${val} Perutahs`
            }, count);
        }
        this.updateUI();
        return true;
    },

    exchangeCurrency() { this.deductCurrency(0); }
};
