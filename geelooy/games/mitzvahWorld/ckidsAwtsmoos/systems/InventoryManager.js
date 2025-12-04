/**
 * B"H
 * Manages inventory and equipment.
 */
import * as AWTSMOOS from "../awtsmoosCkidsGames.js";
import { CurrencySystem } from "../dvarim/coin.js"; // Import helper

export default class InventoryManager {
    constructor(owner) {
        this.owner = owner;
        this.slots = [];
        this.maxSlots = 36;
        
        this.actionSlots = [];
        this.maxActionSlots = 4;
        
        this.equipment = {
            head: null,
            jacket: null,
            legs: null,
            feet: null,
            rightHand: null, 
            leftHand: null
        };

        this.init();
    }

	
    init() {
        for (let i = 0; i < this.maxSlots; i++) {
            this.slots.push(null);
        }
        for (let i = 0; i < this.maxActionSlots; i++) {
            this.actionSlots.push(null);
        }
    }
    
    save() {
        if (!this.owner || !this.owner.olam) return;
        if (this._saveTimeout) clearTimeout(this._saveTimeout);
        this._saveTimeout = setTimeout(() => {
            const saveData = {
                inventory: {
                    slots: this.slots,
                    equipment: this.equipment
                }
            };
            this.owner.olam.ayshPeula("saveSettings", saveData);
        }, 1000); 
    }
    
    // --- B"H: WALLET & CURRENCY LOGIC ---

    /**
     * Calculates the total value of all coins in inventory (Slots + Action Bar).
     */
    getWalletValue() {
        let total = 0;
        const countSlot = (slot) => {
            if (slot && slot.className === 'Coin') {
                // If item has explicit value property, use it. Defaults to 1.
                const val = slot.value || 1;
                total += val * slot.quantity;
            }
        };

        this.slots.forEach(countSlot);
        this.actionSlots.forEach(countSlot);
        return total;
    }

    /**
     * Removes specific amount of value from inventory, preferring smaller coins,
     * and managing change.
     * Simplification: We remove ALL coins, subtract cost, and add back the remainder using the optimal coin set.
     */
    deductCurrency(amount) {
        const currentTotal = this.getWalletValue();
        if (currentTotal < amount) return false;

        const newTotal = currentTotal - amount;

        // 1. Clear all existing coins
        const clearSlot = (slot, index, array) => {
            if (slot && slot.className === 'Coin') {
                array[index] = null;
            }
        };
        this.slots.forEach(clearSlot);
        this.actionSlots.forEach(clearSlot);

        // 2. Generate new coin set for the remainder
        const change = CurrencySystem.convert(newTotal);

        // 3. Add them back
        for (const [type, count] of Object.entries(change)) {
            // Map type names back to values
            const val = CurrencySystem.VALUES[type];
            this.addItem({
                id: 'coin_' + val,
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

    exchangeCurrency() {
        // Just re-running deductCurrency(0) effectively consolidates everything
        // because it clears all coins and adds back the total value in optimal denominations.
        this.deductCurrency(0);
    }
    // ------------------------------------

    addItem(itemData, quantity = 1) {
        if (!itemData || !itemData.id || !itemData.className) {
            console.error("Inventory: addItem requires an itemData object with id and className.", itemData);
            return false;
        }

        const itemClass = AWTSMOOS[itemData.className];
        if (!itemClass) {
            console.error(`Inventory: Item class "${itemData.className}" not found.`);
            return false;
        }

        const enhancedItemData = { ...itemData };
        if (itemClass.isBuildable) {
            enhancedItemData.isBuildable = true;
        }
        
        // B"H: Ensure coins have correct static properties
        if (enhancedItemData.className === 'Coin') {
             if(!enhancedItemData.value) enhancedItemData.value = 1;
             enhancedItemData.icon = CurrencySystem.getBase64Icon(enhancedItemData.value);
             enhancedItemData.name = CurrencySystem.NAMES[enhancedItemData.value];
        }

        const maxStack = itemClass.stackSize || 512;
        const uniqueItemId = enhancedItemData.id; 

        // Try to stack
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            if (slot && slot.id === uniqueItemId && slot.quantity < maxStack) {
                const canAdd = maxStack - slot.quantity;
                const toAdd = Math.min(quantity, canAdd);
                slot.quantity += toAdd;
                quantity -= toAdd;
                if (quantity <= 0) {
                    this.updateUI();
                    this.save(); 
                    return true;
                }
            }
        }

        // Find empty slot
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] === null) {
                const toAdd = Math.min(quantity, maxStack);
                this.slots[i] = {
                    ...enhancedItemData, 
                    quantity: toAdd
                };
                quantity -= toAdd;
                if (quantity <= 0) {
                   this.updateUI();
                   this.save();
                    return true;
                }
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

        const updatedItem = {
            ...existingItem,
            ...newItemData
        };
        
        const itemClass = AWTSMOOS[updatedItem.className];
        if (itemClass && itemClass.isBuildable) {
            updatedItem.isBuildable = true;
        }

        sourceArray[index] = updatedItem;
        this.updateUI();
        this.save();
    }

    hydrateItems() {
        const processItem = (item) => {
            if (!item || !item.className) return item;
            const ItemClass = AWTSMOOS[item.className];
            if (ItemClass) {
                if (ItemClass.isBuildable) {
                    item.isBuildable = true;
                }
            }
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
            if (slotIndex > -1) {
                this.slots[slotIndex] = null;
            }
            else {
                for (const [key, equippedItem] of Object.entries(this.equipment)) {
                    if (equippedItem === itemReference) {
                        this.equipment[key] = null;
                        this.updateVisuals(key, itemReference, false);
                        break;
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
            if (slot.quantity <= 0) {
                this.slots[slotIndex] = null;
            }
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

        const fromItemEquippedIn = this.isEquipped('inventory', fromInventoryIndex);
        const toItemEquippedIn = this.isEquipped('action', toActionIndex);

        const itemToMove = this.slots[fromInventoryIndex];
        const itemInTarget = this.actionSlots[toActionIndex];
        this.actionSlots[toActionIndex] = itemToMove;
        this.slots[fromInventoryIndex] = itemInTarget;

        if (fromItemEquippedIn) {
            this.equipment[fromItemEquippedIn] = { sourceType: 'action', index: toActionIndex };
        }
        if (toItemEquippedIn) {
            this.equipment[toItemEquippedIn] = { sourceType: 'inventory', index: fromInventoryIndex };
        }

        this.updateUI();
        this.save();
    }
    
    isEquipped(sourceType, index) {
        for (const [slotName, ref] of Object.entries(this.equipment)) {
            if (ref && ref.sourceType === sourceType && ref.index === index) {
                return slotName;
            }
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

            const equippedIn = this.isEquipped('action', actionIndex);
            if (equippedIn) {
                this.equipment[equippedIn] = { sourceType: 'inventory', index: emptySlotIndex };
            }
            
            this.updateUI();
            this.save();
        } else {
            console.log("Inventory is full, cannot move item from action bar.");
        }
    }

    async updateUI() {
        if (!this.owner.olam || !this.owner.olam.ayshPeula) return;

        const formatSlot = async (slot) => {
            if (!slot) return null;
            const itemClass = AWTSMOOS[slot.className];
            return {
                ...slot,
                icon: slot.icon || itemClass?.icon || "",
                description: slot.description || itemClass?.description || "",
                name: slot.name || itemClass?.itemName || slot.className,
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
            // B"H: Use a distinct key for the wallet update
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

        if (itemToUnequip) {
            this.updateVisuals(equipSlotName, itemToUnequip, false);
        }

        this.equipment[equipSlotName] = null;
        
        this.updateUI();
        this.save();
        if (equipSlotName === 'rightHand') this.owner.updateHandState();
    }

    
}