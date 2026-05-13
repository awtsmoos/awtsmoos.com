
/**
 * B"H
 * @module InventoryManager
 * @description
 * The central coordination point for the player's possessions.
 * Now fortified with absolute prototype bonding to ensure every method
 * is reachable by the soul in the heat of commerce or battle.
 */
import DataStore from "./storage/DataStore.js";
import ItemEnricher from "./logic/ItemEnricher.js";
import Equipper from "./logic/Equipper.js";
import itemsMethods from "./methods/items.js"; // B"H: Explicitly importing all methods
import uiMethods from "./methods/ui.js";
import movementMethods from "./methods/movement.js";

export default class InventoryManager {
    constructor(owner) {
        this.owner = owner;
        this.maxSlots = 36;
        this.maxActionSlots = 6;
        this.equipment = { 
            head: null, 
            shirt: null, 
            jacket: null, 
            legs: null, 
            feet: null, 
            rightHand: null, 
            leftHand: null, 
            eyes: null 
        };
        this.activeContainer = null;
        this.slots = [];
        this.actionSlots = [];
        
        DataStore.initialize(this);
    }

    enrichItemData(data) { return ItemEnricher.run(data); }
    equipItem(p) { Equipper.equip(this, p); }
    unequipItem(s) { Equipper.unequip(this, s); }

    hydrateItems() {
        this.slots = this.slots.map(s => this.enrichItemData(s));
        this.actionSlots = this.actionSlots.map(s => this.enrichItemData(s));
    }

    save() {
        if (this.owner.olam && this.owner.olam.userProgressManager) {
            this.owner.olam.userProgressManager.save();
        }
    }
}

import ChasveiAwtsmoos from "../../utils/ChasveiAwtsmoos.js";

/**
 * B"H: THE BINDING
 * We manually stitch every faculty into the prototype with Divine Emanation
 * to ensure they are available even when the class is being hydrated across the worker threshold.
 */
ChasveiAwtsmoos.emanate(InventoryManager.prototype, [
    itemsMethods,
    uiMethods,
    movementMethods
]);
