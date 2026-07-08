
/**
 * B"H
 * @module ItemMethods
 */
import { CurrencySystem } from "../../../dvarim/currencySystem.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { ITEM_REGISTRY } from "../data/registry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import ItemEnricher from "../logic/ItemEnricher.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default {
    /**
     * @function enrichItemData
     * @description Bridges raw data with spiritual archetypes.
     */
    enrichItemData(itemData) {
        return ItemEnricher.run(itemData);
    },

    /**
     * @function addItem
     * @description Summons a new spark into the Treasury.
     */
    addItem(itemData, quantity = 1) {
        if (!itemData || !itemData.className) return false;

        const enriched = this.enrichItemData({ ...itemData });
        const maxStack = enriched.stackSize || 512;
        
        let remaining = quantity;
        const targetSlots = this.slots;

        // 1. Stack into existing vessels
        for (let i = 0; i < targetSlots.length; i++) {
            const slot = targetSlots[i];
            if (slot && slot.className === enriched.className && slot.name === enriched.name && slot.quantity < maxStack) {
                const space = maxStack - slot.quantity;
                const toAdd = Math.min(remaining, space);
                slot.quantity += toAdd;
                remaining -= toAdd;
                if (remaining <= 0) break;
            }
        }

        // 2. Occupy empty voids
        if (remaining > 0) {
            for (let i = 0; i < targetSlots.length; i++) {
                if (targetSlots[i] === null) {
                    const toAdd = Math.min(remaining, maxStack);
                    targetSlots[i] = { ...enriched, quantity: toAdd };
                    remaining -= toAdd;
                    if (remaining <= 0) break;
                }
            }
        }
        
        if (remaining < quantity) {
            this.updateUI();
            this.save();
        }
        
        return remaining <= 0;
    },
    
    updateItem(sourceType, index, newItemData) {
        const array = this.getSourceArray(sourceType);
        if (!array || index < 0 || index >= array.length) return;
        
        const existing = array[index];
        if (!existing) return;
        
        array[index] = this.enrichItemData({ ...existing, ...newItemData });
        this.updateUI();
        this.save();
    },

    hydrateItems() {
        const hydrate = (item) => {
            if (!item) return null;
            const res = this.enrichItemData(item);
            if (res.isContainer && res.customData && res.customData.slots) {
                res.customData.slots = res.customData.slots.map(hydrate);
            }
            return res;
        };
        this.slots = this.slots.map(hydrate);
        this.actionSlots = this.actionSlots.map(hydrate);
    },

    consumeItem(itemRef, amount = 1) {
        if (!itemRef) return;
        itemRef.quantity -= amount;
        if (itemRef.quantity <= 0) {
            // Find and eliminate the empty vessel
            const clearArr = (arr) => {
                const idx = arr.indexOf(itemRef);
                if (idx > -1) { arr[idx] = null; return true; }
                return false;
            };

            if (!clearArr(this.slots)) {
                if (!clearArr(this.actionSlots)) {
                    // Check equipment
                    for (const [key, ref] of Object.entries(this.equipment)) {
                        if (ref) {
                            const src = this.getSourceArray(ref.sourceType);
                            if (src && src[ref.index] === itemRef) {
                                this.equipment[key] = null;
                                this.updateVisuals(key, itemRef, false);
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

    removeItem(index, qty = 1) {
        const slot = this.slots[index];
        if (slot) {
            slot.quantity -= qty;
            if (slot.quantity <= 0) this.slots[index] = null;
            this.updateUI();
            this.save();
            return true;
        }
        return false;
    },

    getWalletValue() {
        let total = 0;
        const count = (s) => { if (s && s.className === 'Coin') total += (s.value || 1) * s.quantity; };
        this.slots.forEach(count);
        this.actionSlots.forEach(count);
        return total;
    }
};
