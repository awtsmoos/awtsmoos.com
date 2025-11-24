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

        const maxStack = itemClass.stackSize || 64;
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
     * Equips an item from inventory into a specific equipment slot.
     * Swaps if something is already there.
     */
    equipItem(inventoryIndex, equipSlotName) {
        const itemToEquip = this.slots[inventoryIndex];
        if (!itemToEquip) return;

        const currentEquipped = this.equipment[equipSlotName];

        // 1. Remove from Inventory
        this.slots[inventoryIndex] = null;

        // 2. If there was something equipped, put it back in inventory
        if (currentEquipped) {
             this.slots[inventoryIndex] = currentEquipped; // Simple swap
             // Disable the visual for the old item
             this.updateVisuals(equipSlotName, currentEquipped, false);
        }

        // 3. Set new equipment
        this.equipment[equipSlotName] = itemToEquip;
        
        // 4. Enable visual for new item
        this.updateVisuals(equipSlotName, itemToEquip, true);

        this.updateUI();
        this.save();
        // Update player hand state immediately if right hand changed
        if (equipSlotName === 'rightHand') {
            this.owner.updateHandState(); 
        }
    }

    /**
     * B"H
     * Unequips an item and tries to put it back in inventory.
     */
    unequipItem(equipSlotName) {
        const itemToUnequip = this.equipment[equipSlotName];
        if (!itemToUnequip) return;

        // Try to add back to inventory
        // We cheat slightly here by using addItem. If full, it might fail (need handling).
        // ideally find first empty slot.
        let added = false;
        for(let i=0; i<this.slots.length; i++) {
            if(this.slots[i] === null) {
                this.slots[i] = itemToUnequip;
                added = true;
                break;
            }
        }

        if (added) {
            this.updateVisuals(equipSlotName, itemToUnequip, false);
            this.equipment[equipSlotName] = null;
            this.updateUI();
            this.save();
             if (equipSlotName === 'rightHand') {
                this.owner.updateHandState();
            }
        } else {
            console.log("Inventory full, cannot unequip!");
        }
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

    async updateUI() {
        if (this.owner.olam && this.owner.olam.ayshPeula) {
            
            // Helper to format slot data
            const formatSlot = async (slot) => {
                 if (!slot) return null;
                 const itemClass = AWTSMOOS[slot.className];
                 return {
                    ...slot,
                    icon: itemClass?.icon || "",
                    description: slot.description || itemClass?.description || "",
                    name: slot.name || itemClass?.itemName || slot.className,
                    // Heuristic to guess slot type if not explicit
                    equipSlot: slot.equipSlot || (slot.className === 'Tool' || slot.className === 'Brick' ? 'rightHand' : 'jacket') 
                 };
            };

            const uiSlots = await Promise.all(this.slots.map(formatSlot));
            
            // Format equipment object for UI
            const uiEquipment = {};
            for (const [key, val] of Object.entries(this.equipment)) {
                uiEquipment[key] = await formatSlot(val);
            }

            this.owner.olam.ayshPeula("ui event", "inventoryScreen", {
                updateSlots: uiSlots,
                updateEquipment: uiEquipment // Send equipment data too
            });
        }
    }
}