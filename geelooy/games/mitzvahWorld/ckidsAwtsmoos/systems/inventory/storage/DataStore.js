
/**
 * B"H
 * @module DataStore
 * @description
 * The digital sanctuary for physical items.
 * Handles the persistent arrays of slots and their initial hydration from the Zikaron (Memory).
 */
export default class DataStore {
    /**
     * @function initialize
     * @description Sets up the base arrays, ensuring they are filled with the breath of potential (null).
     */
    static initialize(instance) {
        instance.slots = instance.slots || [];
        instance.actionSlots = instance.actionSlots || [];
        
        while (instance.slots.length < instance.maxSlots) instance.slots.push(null);
        while (instance.actionSlots.length < instance.maxActionSlots) instance.actionSlots.push(null);
        
        this.loadFromSave(instance);
        instance.updateUI();
    }

    static loadFromSave(instance) {
        if (!instance.owner.olam || !instance.owner.olam.userProgressManager) return;
        const saved = instance.owner.olam.userProgressManager.data.inventory;
        if (saved) {
            if (saved.slots) instance.slots = saved.slots;
            if (saved.actionSlots) instance.actionSlots = saved.actionSlots;
            if (saved.equipment) instance.equipment = saved.equipment;
            
            // B"H: Enforce the boundaries of the vessels!
            while (instance.slots.length < instance.maxSlots) instance.slots.push(null);
            while (instance.actionSlots.length < instance.maxActionSlots) instance.actionSlots.push(null);
        }
    }
}
