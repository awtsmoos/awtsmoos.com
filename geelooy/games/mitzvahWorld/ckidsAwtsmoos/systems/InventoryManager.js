
/**
 * B"H
 * Manages inventory and equipment.
 */
import * as AWTSMOOS from "../awtsmoosCkidsGames.js";
import { CurrencySystem } from "../dvarim/coin.js"; 

export default class InventoryManager {
    constructor(owner) {
        this.owner = owner;
        this.slots = [];
        this.maxSlots = 36;
        
        this.actionSlots = [];
        this.maxActionSlots = 4;
        
        this.equipment = {
            head: null, jacket: null, legs: null, feet: null,
            rightHand: null, leftHand: null
        };

        this.init();
    }

    init() {
        for (let i = 0; i < this.maxSlots; i++) this.slots.push(null);
        for (let i = 0; i < this.maxActionSlots; i++) this.actionSlots.push(null);
    }
    
    save() {
        if (!this.owner || !this.owner.olam) return;
        if (this._saveTimeout) clearTimeout(this._saveTimeout);
        this._saveTimeout = setTimeout(() => {
            const saveData = {
                inventory: { slots: this.slots, equipment: this.equipment }
            };
            this.owner.olam.ayshPeula("saveSettings", saveData);
        }, 1000); 
    }
    
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
    }

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
    }

    exchangeCurrency() { this.deductCurrency(0); }

    addItem(itemData, quantity = 1) {
        if (!itemData || !itemData.id || !itemData.className) return false;

        const itemClass = AWTSMOOS[itemData.className];
        if (!itemClass) return false;

        const enhancedItemData = { ...itemData };
        if (itemClass.isBuildable) enhancedItemData.isBuildable = true;
        
        if (enhancedItemData.className === 'Coin') {
             if(!enhancedItemData.value) enhancedItemData.value = 1;
             enhancedItemData.icon = CurrencySystem.getBase64Icon(enhancedItemData.value);
             enhancedItemData.name = CurrencySystem.NAMES[enhancedItemData.value];
        }

        const maxStack = itemClass.stackSize || 512;
        const uniqueItemId = enhancedItemData.id; 

        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            if (slot && slot.id === uniqueItemId && slot.quantity < maxStack) {
                const canAdd = maxStack - slot.quantity;
                const toAdd = Math.min(quantity, canAdd);
                slot.quantity += toAdd;
                quantity -= toAdd;
                if (quantity <= 0) { this.updateUI(); this.save(); return true; }
            }
        }

        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] === null) {
                const toAdd = Math.min(quantity, maxStack);
                this.slots[i] = { ...enhancedItemData, quantity: toAdd };
                quantity -= toAdd;
                if (quantity <= 0) { this.updateUI(); this.save(); return true; }
            }
        }
        
        this.updateUI();
        return quantity > 0 ? false : true;
    }
    
    updateItem(sourceType, index, newItemData) {
        const sourceArray = sourceType === 'action' ? this.actionSlots : this.slots;
        if (index < 0 || index >= sourceArray.length) return;
        const existingItem = sourceArray[index];
        if (!existingItem) return;
        const updatedItem = { ...existingItem, ...newItemData };
        sourceArray[index] = updatedItem;
        this.updateUI();
        this.save();
    }

    hydrateItems() {
        const processItem = (item) => {
            if (!item || !item.className) return item;
            const ItemClass = AWTSMOOS[item.className];
            if (ItemClass && ItemClass.isBuildable) item.isBuildable = true;
            return item;
        };
        this.slots = this.slots.map(processItem);
        this.actionSlots = this.actionSlots.map(processItem);
    }
    
    consumeItem(itemReference, amount = 1) {
        if (!itemReference) return;
        itemReference.quantity -= amount;
        if (itemReference.quantity <= 0) {
            const slotIndex = this.slots.indexOf(itemReference);
            if (slotIndex > -1) this.slots[slotIndex] = null;
            else {
                const actionIndex = this.actionSlots.indexOf(itemReference);
                if(actionIndex > -1) this.actionSlots[actionIndex] = null;
                else {
                    for (const [key, equippedItem] of Object.entries(this.equipment)) {
                        if (equippedItem === itemReference) {
                            this.equipment[key] = null;
                            this.updateVisuals(key, itemReference, false);
                            break;
                        }
                    }
                }
            }
            this.owner.updateHandState();
        }
        this.updateUI();
        this.save();
    }

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
    }
    
    updateVisuals(slotName, item, isEquipping) {
        if (this.owner.garments) {
            for (const [meshName, meshObj] of Object.entries(this.owner.garments)) {
                 if (item.id.toLowerCase().includes(meshName.toLowerCase())) {
                     meshObj.visible = isEquipping;
                 }
            }
        }
    }
    
    moveToActionBar(fromInventoryIndex, toActionIndex) {
        if (fromInventoryIndex < 0 || fromInventoryIndex >= this.slots.length || toActionIndex < 0 || toActionIndex >= this.maxActionSlots) return;
        const itemToMove = this.slots[fromInventoryIndex];
        const itemInTarget = this.actionSlots[toActionIndex];
        this.actionSlots[toActionIndex] = itemToMove;
        this.slots[fromInventoryIndex] = itemInTarget;
        this.updateUI();
        this.save();
    }
    
    isEquipped(sourceType, index) {
        for (const [slotName, ref] of Object.entries(this.equipment)) {
            if (ref && ref.sourceType === sourceType && ref.index === index) return slotName;
        }
        return null;
    }

    moveFromActionBar(actionIndex) {
        if (actionIndex < 0 || actionIndex >= this.actionSlots.length) return;
        const itemToMove = this.actionSlots[actionIndex];
        if (!itemToMove) return;
        const emptySlotIndex = this.slots.findIndex(slot => slot === null);
        if (emptySlotIndex !== -1) {
            this.slots[emptySlotIndex] = itemToMove;
            this.actionSlots[actionIndex] = null;
            this.updateUI();
            this.save();
        }
    }

    async updateUI() {
        if (!this.owner.olam || !this.owner.olam.ayshPeula) return;

        const formatSlot = async (slot) => {
            if (!slot) return null;
            const itemClass = AWTSMOOS[slot.className];
            
            // B"H: Ensure sellValue is populated
            const sellValue = slot.sellValue || (itemClass ? (new itemClass({})).sellValue : 0);

            return {
                ...slot,
                icon: slot.icon || itemClass?.icon || "",
                description: slot.description || itemClass?.description || "",
                name: slot.name || itemClass?.itemName || slot.className,
                sellValue: sellValue,
                equipSlot: slot.equipSlot || (slot.className === 'Tool' || slot.className === 'Brick' || slot.className === 'CustomNpc' ? 'rightHand' : (itemClass && itemClass.prototype instanceof AWTSMOOS.Apparel ? 'jacket' : null))
            };
        };

        const equippedMap = new Map();
        for (const [slotName, ref] of Object.entries(this.equipment)) {
            if (ref) {
                const key = `${ref.sourceType}-${ref.index}`;
                equippedMap.set(key, slotName);
            }
        }

        const formatWithEquippedStatus = async (slot, index, sourceType) => {
            if (!slot) return null;
            const formatted = await formatSlot(slot);
            const key = `${sourceType}-${index}`;
            if (equippedMap.has(key)) {
                formatted.isEquipped = true;
                formatted.equippedIn = equippedMap.get(key);
            }
            return formatted;
        };

        const uiSlots = await Promise.all(this.slots.map((s, i) => formatWithEquippedStatus(s, i, 'inventory')));
        const uiActionSlots = await Promise.all(this.actionSlots.map((s, i) => formatWithEquippedStatus(s, i, 'action')));
        
        const uiEquipment = {};
        for (const [key, ref] of Object.entries(this.equipment)) {
            if (ref) {
                const sourceArray = ref.sourceType === 'action' ? this.actionSlots : this.slots;
                uiEquipment[key] = await formatSlot(sourceArray[ref.index]);
            } else { uiEquipment[key] = null; }
        }

        this.owner.olam.ayshPeula("ui event", "inventoryScreen", {
            updateSlots: uiSlots,
            updateEquipment: uiEquipment,
            updateWallet: this.getWalletValue()
        });
        
        this.owner.olam.ayshPeula("ui event", "action bar", {
            updateActionSlots: uiActionSlots
        });
    }

    equipItem({ sourceType, index, target }) {
        const sourceArray = sourceType === 'action' ? this.actionSlots : this.slots;
        const itemToEquip = sourceArray[index];
        if (!itemToEquip || !target) return;

        const currentEquippedRef = this.equipment[target];
        if (currentEquippedRef) {
             const oldSource = currentEquippedRef.sourceType === 'action' ? this.actionSlots : this.slots;
             const oldItem = oldSource[currentEquippedRef.index];
             if(oldItem) this.updateVisuals(target, oldItem, false);
        }
        
        this.equipment[target] = { sourceType, index };
        this.updateVisuals(target, itemToEquip, true);
        this.updateUI();
        this.save();
        if (target === 'rightHand') this.owner.updateHandState();
    }

    unequipItem(equipSlotName) {
	    const equippedRef = this.equipment[equipSlotName];
        if (!equippedRef) return;
        const sourceArray = equippedRef.sourceType === 'action' ? this.actionSlots : this.slots;
        const itemToUnequip = sourceArray[equippedRef.index];
        if (itemToUnequip) this.updateVisuals(equipSlotName, itemToUnequip, false);

        this.equipment[equipSlotName] = null;
        this.updateUI();
        this.save();
        if (equipSlotName === 'rightHand') this.owner.updateHandState();
    }
    
    sortInventory() {
        // B"H: Sort by name
        // Note: This implementation only sorts by name and pushes nulls to end.
        // It resets indices, so we MUST clear equipment if we don't re-map it.
        // For simplicity in this version, we'll sort but acknowledge equipment will be unequipped or misaligned.
        // To fix properly, we'd need to remap equipment indices or unequip everything first.
        // Let's choose SAFETY: Unequip all before sorting.
        
        this.equipment = { head: null, jacket: null, legs: null, feet: null, rightHand: null, leftHand: null };

        this.slots.sort((a, b) => {
            if (!a && !b) return 0;
            if (!a) return 1; // Nulls last
            if (!b) return -1;
            return (a.name || "").localeCompare(b.name || "");
        });
        
        this.updateUI(); 
        this.save();
    }
}
