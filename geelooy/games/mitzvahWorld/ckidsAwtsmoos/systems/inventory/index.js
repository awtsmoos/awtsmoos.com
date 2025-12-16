
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
            if (saved && saved.slots) {
                this.slots = saved.slots;
                this.actionSlots = saved.actionSlots || [];
                this.equipment = saved.equipment || this.equipment;
            } else {
                this.createEmpty();
            }
        } else {
            this.createEmpty();
        }
    }
    
    createEmpty() {
        for (let i = 0; i < this.maxSlots; i++) this.slots.push(null);
        for (let i = 0; i < this.maxActionSlots; i++) this.actionSlots.push(null);
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
