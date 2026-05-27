

/**
 * B"H
 * Inventory System Main Entry
 */
import itemsMethods from "./methods/items.js";
import uiMethods from "./methods/ui.js";
import movementMethods from "./methods/movement.js";

export default class InventoryManager {
    constructor(owner) {
        this.owner = owner;
        this.slots = [];
        this.maxSlots = 36;
        this.actionSlots = [];
        this.maxActionSlots = 4;
        this.equipment = { head: null, jacket: null, legs: null, feet: null, rightHand: null, leftHand: null };
        this.activeContainer = null;
        this.init();
    }

    init() {
        // Load from UserProgressManager if available
        if (this.owner.olam && this.owner.olam.userProgressManager) {
            const saved = this.owner.olam.userProgressManager.data.inventory;
            if (saved && saved.slots && Array.isArray(saved.slots)) {
                this.slots = saved.slots;
                this.actionSlots = saved.actionSlots || [];
                this.equipment = saved.equipment || this.equipment;
            } 
        }
        
        // B"H: CRITICAL FIX - Ensure slots array is fully populated
        this.ensureCapacity();
    }
    
    ensureCapacity() {
        // Fill main slots
        while (this.slots.length < this.maxSlots) {
            this.slots.push(null);
        }
        // Fill action slots
        while (this.actionSlots.length < this.maxActionSlots) {
            this.actionSlots.push(null);
        }
    }
    
    createEmpty() {
        this.slots = [];
        this.actionSlots = [];
        this.ensureCapacity();
    }
    
    save() {
        if (this.owner.olam && this.owner.olam.userProgressManager) {
            this.owner.olam.userProgressManager.save();
        }
    }
}

Object.assign(InventoryManager.prototype, itemsMethods);
Object.assign(InventoryManager.prototype, uiMethods);
Object.assign(InventoryManager.prototype, movementMethods);
