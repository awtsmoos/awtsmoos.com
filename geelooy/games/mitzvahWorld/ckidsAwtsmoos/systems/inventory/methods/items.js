// B"H
/**
 * Item manipulation logic for InventoryManager.
 * Completed registry for full legacy support.
 */
import { CurrencySystem } from "../../../dvarim/coin.js";

const ITEM_REGISTRY = {
    "Brick": { isBuildable: true, stackSize: 1024, icon: "/games/mitzvahWorld/icons/items/brick.svg" },
    "Stairs": { isBuildable: true, stackSize: 64, icon: "/games/mitzvahWorld/icons/items/brick.svg" },
    "Tool": { stackSize: 1, icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImhhbmRsZUdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOEI0NTEzO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojQTA1MjJEO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcjojOEI0NTEzO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJoZWFkR3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRDcwMDtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkE1MDA7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5ZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjIzNiIgeT0iMTUwIiB3aWR0aD0iNDAiIGhlaWdodD0iMzAwIiByeD0iNSIgZmlsbD0idXJsKCNoYW5kbGVHcmFkKSIgc3Ryb2tlPSIjNWUzMDBkIiBzdHJva2Utd2lkdGg9IjIiIHRyYW5zZm9ybT0icm90YXRlKC0xNSAyNTYgMjU2KSIvPjxnIHRyYW5zZm9ybT0icm90YXRlKC0xNSAyNTYgMjU2KSI+PHJlY3QgeD0iMTY2IiB5PSIxMDAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI4MCIgcng9IjUiIGZpbGw9IiM1NTUiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgeD0iMjI2IiB5PSI4MCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSIxMCIgZmlsbD0idXJsKCNoZWFkR3JhZCkiIHN0cm9rZT0iI0I4ODYwQiIgc3Ryb2tlLXdpZHRoPSI0Ii8+PC9nPjwvc3ZnPg==" },
    "Teffilin": { isTool: true, stackSize: 1, icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgcng9IjUiIGZpbGw9IiMxMTEiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgeD0iMzUiIHk9IjM1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IiMwMDAiLz48cGF0aCBkPSJNNDAgNjAgTDQwIDQ1IEw1MCA2MCBMNjAgNDUgTDYwIDYwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC44Ii8+PHBhdGggZD0iTTI1IDUwIEwxMCA1MCBNNzUgNTAgTDkwIDUwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNiIvPjwvc3ZnPg==" },
    "Apparel": { stackSize: 1 },
    "Container": { stackSize: 1, isContainer: true, icon: "📦" },
    "ProceduralTree": { isBuildable: true, stackSize: 64 },
    "ProceduralPool": { isBuildable: true, stackSize: 1 },
    "NatureTool": { isPainter: true, stackSize: 1 },
    "CustomNpc": { isBuildable: true, stackSize: 1 },
    "HotAirBalloon": { isBuildable: true, stackSize: 1 },
    "ProceduralCar": { isBuildable: true, stackSize: 1 },
    "Telescope": { isTool: true, stackSize: 1 },
    "GrapplingHook": { isTool: true, stackSize: 1 },
    "FishingRod": { isTool: true, stackSize: 1 },
    "Pickaxe": { isTool: true, stackSize: 1 },
    "Shovel": { isTool: true, stackSize: 1 },
    "RoadTool": { isTool: true, stackSize: 1 },
    "Blueprint": { isBuildable: true, stackSize: 1 },
    "Wheat": { stackSize: 64, icon: "🌾" },
    "Mill": { isBuildable: true, stackSize: 1 },
    "Oven": { isBuildable: true, stackSize: 1 },
    "Fire": { isBuildable: true, stackSize: 1 },
    "Fruit": { stackSize: 64, icon: "🍎" }
};

export default {
    enrichItemData(itemData) {
        if (!itemData || !itemData.className) return itemData;
        const originalIcon = itemData.icon;
        
        const meta = ITEM_REGISTRY[itemData.className] || {};

        if (meta.isBuildable) itemData.isBuildable = true;
        if (meta.isPainter) itemData.isPainter = true;
        if (meta.isTool) itemData.isTool = true;
        if (meta.isContainer) itemData.isContainer = true;
        
        if (itemData.className === 'Coin') {
             if(!itemData.value) itemData.value = 1;
             itemData.icon = CurrencySystem.getBase64Icon(itemData.value);
             itemData.name = CurrencySystem.NAMES[itemData.value];
        }

        if (!itemData.icon) {
            if (originalIcon) itemData.icon = originalIcon;
            else if (meta.icon) itemData.icon = meta.icon;
            else itemData.icon = "";
        }
        
        if (itemData.isContainer || itemData.className === 'Container' || (itemData.customData && itemData.customData.slots)) {
            itemData.isContainer = true;
        }
        
        if (itemData.customData && itemData.customData.color) itemData.isTintable = true;
        if (!itemData.name) itemData.name = itemData.className;
        
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
    
    exchangeCurrency() { this.deductCurrency(0); }
};