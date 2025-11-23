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
     * Adds a specified quantity of an item to the inventory.
     * @param {string} itemClassName - The class name of the item to add (e.g., "Brick").
     * @param {number} quantity - The amount to add.
     * @returns {boolean} - True if the item was added successfully, false if the inventory is full.
     */
    addItem(itemClassName, quantity = 1, opts = {}) {
        // Dynamically get the item's class from the AWTSMOOS exports
        const itemClass = AWTSMOOS[itemClassName];
        if (!itemClass) {
            console.error(`Inventory: Item class "${itemClassName}" not found.`);
            return false;
        }

        const maxStack = itemClass.stackSize || 64;

        // First, try to stack with existing items of the same type
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            if (slot && slot.item === itemClassName && slot.quantity < maxStack) {
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

        // If items remain, find the first empty slot to create a new stack
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] === null) {
                const toAdd = Math.min(quantity, maxStack);
                this.slots[i] = {
                    item: itemClassName,
                    quantity: toAdd,
                    options: opts
                };
                quantity -= toAdd;
                if (quantity <= 0) {
                   this.updateUI();
                    return true;
                }
            }
        }
        
        console.warn("Inventory is full!");
        this.updateUI(); // Update UI even if partially added
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
                const itemClass = AWTSMOOS[slot.item];
                if (!itemClass) return null;
                
                return {
                    ...slot,
                    icon: itemClass.icon || "",
                    description: itemClass.description || "No description.",
                    name: itemClass.itemName || slot.item
                };
            }));

            this.owner.olam.ayshPeula("ui event", "inventoryScreen", {
                updateSlots: uiSlots
            });
        }
    }
}