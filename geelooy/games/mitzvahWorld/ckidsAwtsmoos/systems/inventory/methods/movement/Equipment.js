
// B"H
export default {
    equipItem({ sourceType, index, target }) {
        let containerId = null;
        
        if (sourceType === 'container') {
            if (!this.activeContainer) {
                console.warn("B\"H: Cannot equip from container when no container is active.");
                return;
            }
            containerId = this.activeContainer.id;
        }
        
        let sourceArray;
        if (sourceType === 'action') sourceArray = this.actionSlots;
        else if (sourceType === 'inventory') sourceArray = this.slots;
        else if (sourceType === 'container') sourceArray = this.activeContainer.customData.slots;
        
        const itemToEquip = sourceArray ? sourceArray[index] : null;
        if (!itemToEquip || !target) return;

        const currentEquippedRef = this.equipment[target];
        if (currentEquippedRef) {
            let oldSourceArray;
            if (currentEquippedRef.sourceType === 'action') oldSourceArray = this.actionSlots;
            else if (currentEquippedRef.sourceType === 'inventory') oldSourceArray = this.slots;
            else if (currentEquippedRef.sourceType === 'container') {
                if (this.activeContainer && this.activeContainer.id === currentEquippedRef.containerId) {
                    oldSourceArray = this.activeContainer.customData.slots;
                } else {
                    const bag = this.slots.find(s => s && s.id === currentEquippedRef.containerId);
                    if (bag && bag.customData && bag.customData.slots) {
                         oldSourceArray = bag.customData.slots;
                    }
                }
            }

            if (oldSourceArray) {
                const oldItem = oldSourceArray[currentEquippedRef.index];
                if(oldItem) this.updateVisuals(target, oldItem, false);
            }
        }
        
        const newRef = { sourceType, index };
        if (containerId) newRef.containerId = containerId;
        
        this.equipment[target] = newRef;
        this.updateVisuals(target, itemToEquip, true);
        this.updateUI();
        this.save();
        if (target === 'rightHand') this.owner.updateHandState();
    },

    unequipItem(equipSlotName) {
        const equippedRef = this.equipment[equipSlotName];
        if (!equippedRef) return;
        
        let sourceArray;
        if (equippedRef.sourceType === 'action') sourceArray = this.actionSlots;
        else if (equippedRef.sourceType === 'inventory') sourceArray = this.slots;
        else if (equippedRef.sourceType === 'container') {
             if (this.activeContainer && this.activeContainer.id === equippedRef.containerId) {
                 sourceArray = this.activeContainer.customData.slots;
             } else {
                 const bag = this.slots.find(s => s && s.id === equippedRef.containerId);
                 if (bag) sourceArray = bag.customData.slots;
             }
        }

        if (sourceArray) {
            const itemToUnequip = sourceArray[equippedRef.index];
            if (itemToUnequip) this.updateVisuals(equipSlotName, itemToUnequip, false);
        }

        this.equipment[equipSlotName] = null;
        this.updateUI();
        this.save();
        if (equipSlotName === 'rightHand') this.owner.updateHandState();
    }
};
