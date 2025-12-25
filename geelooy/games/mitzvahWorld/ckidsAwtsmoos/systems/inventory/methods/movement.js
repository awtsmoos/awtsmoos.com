//B"H
/**
 * Item movement and equipment logic.
 * Purified of the "NaN" fragments through strict numeric validation.
 */

export default {
    getSourceArray(sourceType) {
        if (sourceType === 'action') return this.actionSlots;
        if (sourceType === 'inventory') return this.slots;
        if (sourceType === 'container') return this.activeContainer ? this.activeContainer.customData.slots : null;
        return null;
    },

    moveItem({ fromSource, fromIndex, toSource, toIndex, amount }) {
        try {
            const fromArray = this.getSourceArray(fromSource);
            const toArray = this.getSourceArray(toSource);
            
            const fIdx = parseInt(fromIndex);
            const tIdx = parseInt(toIndex);
            
            if (!fromArray || !toArray) return;
            if (isNaN(fIdx) || fIdx < 0 || fIdx >= fromArray.length) return;
            if (isNaN(tIdx) || tIdx < 0 || tIdx >= toArray.length) return;

            const item = fromArray[fIdx];
            if (!item) return;

            const fromContainerId = fromSource === 'container' && this.activeContainer ? this.activeContainer.id : null;
            const toContainerId = toSource === 'container' && this.activeContainer ? this.activeContainer.id : null;

            // B"H: Strict Number Validation
            const maxQty = Number.isSafeInteger(parseInt(item.quantity)) ? parseInt(item.quantity) : 1;
            let qtyToMove = (amount === null || amount === undefined) ? maxQty : parseInt(amount);
            
            if (!Number.isSafeInteger(qtyToMove) || qtyToMove <= 0) qtyToMove = maxQty;
            if (qtyToMove > maxQty) qtyToMove = maxQty;

            if (fromSource === toSource && fIdx === tIdx) return;

            const targetItem = toArray[tIdx];

            if (!targetItem) {
                if (qtyToMove >= maxQty) {
                    toArray[tIdx] = item; 
                    fromArray[fIdx] = null;
                    this.updateEquipmentRefAfterMove(fromSource, fIdx, toSource, tIdx, fromContainerId, toContainerId);
                } else {
                    const newItem = { ...item, quantity: qtyToMove, id: item.id + "_split_" + Date.now() };
                    newItem.isEquipped = false;
                    delete newItem.equippedIn;
                    
                    toArray[tIdx] = newItem;
                    item.quantity = maxQty - qtyToMove; // B"H Safe subtraction
                    if (item.quantity <= 0) {
                        fromArray[fIdx] = null;
                        this.updateEquipmentRefAfterMove(fromSource, fIdx, null, null, fromContainerId, null);
                    }
                }
            } else {
                if (targetItem.className === item.className && targetItem.name === item.name) {
                    const maxStack = 512; 
                    const currentTargetQty = Number.isSafeInteger(parseInt(targetItem.quantity)) ? parseInt(targetItem.quantity) : 1;
                    const space = maxStack - currentTargetQty;
                    const actualMove = Math.min(qtyToMove, space);
                    
                    if (actualMove > 0) {
                        targetItem.quantity = currentTargetQty + actualMove;
                        item.quantity = maxQty - actualMove;
                        if (item.quantity <= 0) {
                            fromArray[fIdx] = null;
                            this.updateEquipmentRefAfterMove(fromSource, fIdx, null, null, fromContainerId, null);
                        }
                    }
                } else {
                    if (qtyToMove >= maxQty) {
                        toArray[tIdx] = item;
                        fromArray[fIdx] = targetItem;
                        this.updateEquipmentRefAfterMove(fromSource, fIdx, toSource, tIdx, fromContainerId, toContainerId); 
                        this.updateEquipmentRefAfterMove(toSource, tIdx, fromSource, fIdx, toContainerId, fromContainerId); 
                    }
                }
            }
            this.updateUI();
            this.save();
        } catch(e) {
            console.error("B\"H Inventory Error in moveItem:", e);
            this.updateUI();
        }
    },
    
    updateEquipmentRefAfterMove(oldSource, oldIndex, newSource, newIndex, oldContainerId = null, newContainerId = null) {
        for (const [key, ref] of Object.entries(this.equipment)) {
            if (ref && ref.sourceType === oldSource && ref.index === oldIndex) {
                if (oldSource === 'container' && ref.containerId !== oldContainerId) {
                    continue; 
                }

                if (newSource === null) {
                    this.equipment[key] = null;
                    if (key === 'rightHand') this.owner.updateHandState();
                    this.updateVisuals(key, null, false);
                } else {
                    const newRef = { sourceType: newSource, index: newIndex };
                    if (newSource === 'container' && newContainerId) {
                        newRef.containerId = newContainerId;
                    }
                    this.equipment[key] = newRef;
                }
            }
        }
    },

    moveToActionBar(fromInventoryIndex, toActionIndex) {
        this.moveItem({
            fromSource: this.activeContainer ? 'container' : 'inventory',
            fromIndex: fromInventoryIndex,
            toSource: 'action',
            toIndex: toActionIndex
        });
    },
    
    moveFromActionBar(actionIndex) {
        const targetArray = this.activeContainer ? this.activeContainer.customData.slots : this.slots;
        const targetSource = this.activeContainer ? 'container' : 'inventory';
        
        const emptyIndex = targetArray.findIndex(s => s === null);
        if (emptyIndex !== -1) {
            this.moveItem({
                fromSource: 'action',
                fromIndex: actionIndex,
                toSource: targetSource,
                toIndex: emptyIndex
            });
        }
    },

    equipItem({ sourceType, index, target }) {
        let containerId = null;
        
        if (sourceType === 'container') {
            if (!this.activeContainer) return;
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
    },
    
    sortInventory() {
        if (this.activeContainer) return;
        this.equipment = { head: null, jacket: null, legs: null, feet: null, rightHand: null, leftHand: null };

        this.slots.sort((a, b) => {
            if (!a && !b) return 0;
            if (!a) return 1; 
            if (!b) return -1;
            return (a.name || "").localeCompare(b.name || "");
        });
        
        this.updateUI(); 
        this.save();
    }
};