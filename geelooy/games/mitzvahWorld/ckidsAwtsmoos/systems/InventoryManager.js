/**
 * B"H
 * Manages an inventory for a Nivra, handling item data, slots, and UI updates.
 */
import * as AWTSMOOS from "../awtsmoosCkidsGames.js";

export default class InventoryManager {
    constructor(owner) {
        this.owner = owner; // The Nivra that owns this inventory (e.g., the Chossid)
        this.slots = [];
        this.maxSlots = 36; // The total number of slots in the inventory
        this.init();
    }

    init() {
        // Initialize empty slots
        for (let i = 0; i < this.maxSlots; i++) {
            this.slots.push(null);
        }
    }

   /**
     * B"H
     * Adds an item defined by a data object to the inventory.
     * @param {object} itemData - An object describing the item, e.g., { id: 'brick_2x2x2', className: 'Brick', dimensions: {x:2,y:2,z:2} }
     * @param {number} quantity - The amount to add.
     * @returns {boolean} - True if the item was added successfully.
     */
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
        const uniqueItemId = itemData.id; // We'll use this for stacking

        // First, try to stack with existing items of the EXACT same type (same ID)
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            // B"H - CHANGE: Compare the unique ID instead of the class name
            if (slot && slot.id === uniqueItemId && slot.quantity < maxStack) {
                const canAdd = maxStack - slot.quantity;
                const toAdd = Math.min(quantity, canAdd);
                slot.quantity += toAdd;
                quantity -= toAdd;
                if (quantity <= 0) {
                    this.updateUI();
                    return true;
                }
            }
        }

        // If items remain, find an empty slot for the new stack
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] === null) {
                const toAdd = Math.min(quantity, maxStack);
                // B"H - CHANGE: Store the entire itemData object in the slot
                this.slots[i] = {
                    ...itemData, // Copy all properties from itemData
                    quantity: toAdd
                };
                quantity -= toAdd;
                if (quantity <= 0) {
                   this.updateUI();
                    return true;
                }
            }
        }
        
        console.warn("Inventory is full!");
        this.updateUI();
        return quantity > 0 ? false : true;
    }

    /**
     * Removes a specified quantity of an item from a given slot.
     * @param {number} slotIndex - The index of the slot to remove from.
     * @param {number} quantity - The amount to remove.
     * @returns {boolean} - True if the item was removed successfully.
     */
    removeItem(slotIndex, quantity = 1) {
        const slot = this.slots[slotIndex];
        if (slot) {
            slot.quantity -= quantity;
            if (slot.quantity <= 0) {
                this.slots[slotIndex] = null; // Clear the slot if empty
            }
            this.updateUI();
            return true;
        }
        return false;
    }
    /**
     * Sends the current inventory state to the UI thread for rendering.
     * It enriches the slot data with details like icons and descriptions.
     */
    async updateUI() {
        if (this.owner.olam && this.owner.olam.ayshPeula) {
            const uiSlots = await Promise.all(this.slots.map(async slot => {
                if (!slot) return null;
                // B"H - CHANGE: Use className from the slot data
                const itemClass = AWTSMOOS[slot.className]; 
                if (!itemClass) return null;
                
                return {
                    ...slot,
                    // Use static properties for display, but keep instance data from the slot
                    icon: itemClass.icon || "",
                    description: slot.description || itemClass.description || "No description.",
                    name: slot.name || itemClass.itemName || slot.className
                };
            }));

            this.owner.olam.ayshPeula("ui event", "inventoryScreen", {
                updateSlots: uiSlots
            });
        }
    }
}