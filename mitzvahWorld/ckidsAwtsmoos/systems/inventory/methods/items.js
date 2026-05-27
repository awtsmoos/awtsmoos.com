
/**
 * B"H
 * Item manipulation logic for InventoryManager.
 * Decoupled from Class Definitions to prevent circular dependency loops.
 */
import { CurrencySystem } from "../../../dvarim/currencySystem.js";
import { ITEM_REGISTRY } from "../data/registry.js";

export default {
    enrichItemData(itemData) {
        if (!itemData || !itemData.className) return itemData;
        const originalIcon = itemData.icon;
        
        // B"H: Use Registry instead of Class Static properties to avoid circular dependencies
        const meta = ITEM_REGISTRY[itemData.className] || {};

        if (itemData.className === 'ProceduralTree') itemData.isBuildable = true;
        if (itemData.className === 'NatureTool') itemData.isPainter = true;
        if (itemData.className === 'Brick' || itemData.className === 'CustomNpc' || itemData.className === 'Stairs') itemData.isBuildable = true;
        if (itemData.className === 'Lava') itemData.isBuildable = true;

        if (meta.isBuildable) itemData.isBuildable = true;
        if (meta.isPainter) itemData.isPainter = true;
        if (meta.isTool) itemData.isTool = true;
        if (meta.isContainer) itemData.isContainer = true;

        if (itemData.sellValue === undefined) itemData.sellValue = 0; 
        
        // B"H: Fallback to Registry name/desc if missing in instance
        if (!itemData.name) itemData.name = meta.name || itemData.className;
        if (!itemData.description) itemData.description = meta.description || "";
        
        if (!itemData.icon) {
            if (originalIcon) itemData.icon = originalIcon;
            else if (meta.icon) itemData.icon = meta.icon;
            else itemData.icon = "";
        }
        
        if (itemData.className === 'Coin') {
             if(!itemData.value) itemData.value = 1;
             itemData.icon = CurrencySystem.getBase64Icon(itemData.value);
             itemData.name = CurrencySystem.NAMES[itemData.value];
        }

        if (itemData.customData && itemData.customData.color) itemData.isTintable = true;
        if (itemData.isContainer || itemData.className === 'Container' || (itemData.customData && itemData.customData.slots)) itemData.isContainer = true;
        
        return itemData;
    },

    addItem(itemData, quantity = 1) {
        if (!itemData || !itemData.id || !itemData.className) return false;

        const enhancedItemData = this.enrichItemData({ ...itemData });
        const meta = ITEM_REGISTRY[enhancedItemData.className] || {};
        const maxStack = meta.stackSize || 512;
        
        const uniqueItemId = enhancedItemData.id; 

        const targetSlots = this.slots;
        let added = false;

        for (let i = 0; i < targetSlots.length; i++) {
            const slot = targetSlots[i];
            if (slot && slot.id === uniqueItemId && slot.quantity < maxStack) {
                const canAdd = maxStack - slot.quantity;
                const toAdd = Math.min(quantity, canAdd);
                slot.quantity += toAdd;
                quantity -= toAdd;
                added = true;
                if (quantity <= 0) break;
            }
        }

        if (quantity > 0) {
            for (let i = 0; i < targetSlots.length; i++) {
                if (targetSlots[i] === null) {
                    const toAdd = Math.min(quantity, maxStack);
                    targetSlots[i] = { ...enhancedItemData, quantity: toAdd };
                    quantity -= toAdd;
                    added = true;
                    if (quantity <= 0) break;
                }
            }
        }
        
        if (added) {
            this.updateUI();
            this.save();
            
            if (this.owner.olam && this.owner.olam.shlichusHandler) {
                if (this._questCheckTimeout) clearTimeout(this._questCheckTimeout);
                this._questCheckTimeout = setTimeout(() => {
                    this.owner.olam.shlichusHandler.update(0.1); 
                }, 200);
            }
        }
        
        return quantity <= 0;
    },
    
    updateItem(sourceType, index, newItemData) {
        let sourceArray;
        if (sourceType === 'container') sourceArray = this.activeContainer ? this.activeContainer.customData.slots : null;
        else sourceArray = sourceType === 'action' ? this.actionSlots : this.slots;
        
        if (!sourceArray || index < 0 || index >= sourceArray.length) return;
        const existingItem = sourceArray[index];
        if (!existingItem) return;
        
        const updatedItem = this.enrichItemData({ ...existingItem, ...newItemData });
        sourceArray[index] = updatedItem;
        this.updateUI();
        this.save();
    },

    hydrateItems() {
        const hydrateRecursive = (item) => {
            if (!item) return null;
            const enriched = this.enrichItemData(item);
            if (enriched.isContainer && enriched.customData && enriched.customData.slots) {
                enriched.customData.slots = enriched.customData.slots.map(hydrateRecursive);
            }
            return enriched;
        };
        this.slots = this.slots.map(hydrateRecursive);
        this.actionSlots = this.actionSlots.map(hydrateRecursive);
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
