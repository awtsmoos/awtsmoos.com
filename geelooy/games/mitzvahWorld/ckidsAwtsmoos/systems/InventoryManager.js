/**
 * B"H
 * Manages inventory and equipment.
 */
import * as AWTSMOOS from "../awtsmoosCkidsGames.js";

export default class InventoryManager {
    constructor(owner) {
        this.owner = owner;
        this.slots = [];
        this.maxSlots = 36;
        
        // B"H: The vessel for items held in readiness (the hotbar).
        this.actionSlots = [];
        this.maxActionSlots = 4;
        
        
        // B"H - NEW: Equipment Slots
        this.equipment = {
            head: null,
            jacket: null,
            legs: null,
            feet: null,
            rightHand: null, // Active Tool/Weapon
            leftHand: null
        };

        this.init();
    }

	
    init() {
        for (let i = 0; i < this.maxSlots; i++) {
            this.slots.push(null);
        }
        // B"H: Initialize the action slots as empty potential.
        for (let i = 0; i < this.maxActionSlots; i++) {
            this.actionSlots.push(null);
        }
    }
    
    save() {
        // Only save if there is an active Olam
        if (!this.owner || !this.owner.olam) return;

        // Clear any pending save to prevent spamming
        if (this._saveTimeout) clearTimeout(this._saveTimeout);

        // Wait 1 second after the last change, then save
        this._saveTimeout = setTimeout(() => {
            
            // Prepare the data
            const saveData = {
                inventory: {
                    slots: this.slots,
                    equipment: this.equipment
                }
            };

            // Send to Main Thread
            this.owner.olam.ayshPeula("saveSettings", saveData);
            
            // console.log("B\"H - Inventory Saved to Cloud");
        }, 1000); 
    }

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

        const maxStack = itemClass.stackSize || 512;
        const uniqueItemId = itemData.id; 

        // Try to stack first
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
                    ...itemData, 
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
    
    /**
     * B"H
     * Reduces the quantity of a specific item object, regardless of where it is
     * (Hotbar OR Equipment). If quantity hits 0, it clears the slot/equipment.
     */
    consumeItem(itemReference, amount = 1) {
        if (!itemReference) return;

        itemReference.quantity -= amount;

        if (itemReference.quantity <= 0) {
            // 1. Check if it's in the main inventory slots
            const slotIndex = this.slots.indexOf(itemReference);
            if (slotIndex > -1) {
                this.slots[slotIndex] = null;
            }

            // 2. Check if it's in equipment
            else {
                for (const [key, equippedItem] of Object.entries(this.equipment)) {
                    if (equippedItem === itemReference) {
                        this.equipment[key] = null;
                        // Also update visuals (remove mesh from player model)
                        this.updateVisuals(key, itemReference, false);
                        break;
                    }
                }
            }
            
            // If we just consumed the last item in hand, update the ghost block state
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
    

    

    

    /**
     * B"H
     * Toggles meshes on the player model based on equipment.
     * Looks for children in `this.owner.garments` or `this.owner.bodyParts`.
     */
    updateVisuals(slotName, item, isEquipping) {
        // Example: item.id might be "jacket_black"
        // The player model needs a child named "jacket" or similar.
        
        // 1. Check for direct garment mapping
        // (Assumes you set up `this.owner.garments` in `boyrayNivra.js`)
        if (this.owner.garments) {
            // Logic: If equipping a "Jacket", turn ON the jacket mesh. 
            // If unequipping, turn OFF.
            
            // Ideally, the Item Data has a property 'garmentName' matching the mesh name.
            // Fallback to checking if the item ID string contains the mesh name.
            
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
    
    
    /**
     * B"H
     * A helper to check if an item at a specific slot is currently equipped.
     * Returns the equipment slot name (e.g., 'rightHand') if true, otherwise null.
     */
    isEquipped(sourceType, index) {
        for (const [slotName, ref] of Object.entries(this.equipment)) {
            if (ref && ref.sourceType === sourceType && ref.index === index) {
                return slotName;
            }
        }
        return null;
    }

    /**
     * B"H
     * Moves an item from an action slot back to the first available inventory slot.
     */
    moveFromActionBar(actionIndex) {
        if (actionIndex < 0 || actionIndex >= this.actionSlots.length) return;
        const itemToMove = this.actionSlots[actionIndex];
        if (!itemToMove) return;

        const emptySlotIndex = this.slots.findIndex(slot => slot === null);

        if (emptySlotIndex !== -1) {
            this.slots[emptySlotIndex] = itemToMove;
            this.actionSlots[actionIndex] = null;

            // If the moved item was equipped, update its reference to the new inventory slot
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

    /**
     * B"H
     * A vessel for Divine Light to flow into the user interface.
     */
    async updateUI() {
        if (!this.owner.olam || !this.owner.olam.ayshPeula) return;

        const formatSlot = async (slot) => {
            if (!slot) return null;
            const itemClass = AWTSMOOS[slot.className];
            return {
                ...slot,
                icon: itemClass?.icon || "",
                description: slot.description || itemClass?.description || "",
                name: slot.name || itemClass?.itemName || slot.className,
                equipSlot: slot.equipSlot || (slot.className === 'Tool' || slot.className === 'Brick' ? 'rightHand' : (itemClass && itemClass.prototype instanceof AWTSMOOS.Apparel ? 'jacket' : null))
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
            updateEquipment: uiEquipment
        });
        
        this.owner.olam.ayshPeula("ui event", "action bar", {
            updateActionSlots: uiActionSlots
        });
    }
    
    

    /**
     * B"H
     * Equips an item by creating a reference to it. The item does not move.
     */
    equipItem({ sourceType, index, target }) {
        const sourceArray = sourceType === 'action' ? this.actionSlots : this.slots;
        const itemToEquip = sourceArray[index];
        if (!itemToEquip || !target) return;

        // If something is already equipped in the target slot, sever its connection first.
        const currentEquippedRef = this.equipment[target];
        if (currentEquippedRef) {
             const oldSource = currentEquippedRef.sourceType === 'action' ? this.actionSlots : this.slots;
             const oldItem = oldSource[currentEquippedRef.index];
             if(oldItem) this.updateVisuals(target, oldItem, false);
        }
        
        // Create the new spiritual connection (reference)
        this.equipment[target] = { sourceType, index };
        
        this.updateVisuals(target, itemToEquip, true);
        this.updateUI();
        this.save();
        
        if (target === 'rightHand') this.owner.updateHandState();
    }

    /**
     * B"H
     * Unequips an item by severing its reference.
     */
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