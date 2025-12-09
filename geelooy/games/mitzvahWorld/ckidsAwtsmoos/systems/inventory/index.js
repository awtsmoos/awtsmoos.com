
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
        
        this.equipment = {
            head: null, jacket: null, legs: null, feet: null,
            rightHand: null, leftHand: null
        };
        
        this.activeContainer = null;
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
}

// B"H: Mixin modular methods
Object.assign(InventoryManager.prototype, itemsMethods);
Object.assign(InventoryManager.prototype, uiMethods);
Object.assign(InventoryManager.prototype, movementMethods);
