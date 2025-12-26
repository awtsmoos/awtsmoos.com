
// B"H
export default {
    getSourceArray(sourceType) {
        if (sourceType === 'action') return this.actionSlots;
        if (sourceType === 'inventory') return this.slots;
        if (sourceType === 'container') return this.activeContainer ? this.activeContainer.customData.slots : null;
        return null;
    },

    updateEquipmentRefAfterMove(oldSource, oldIndex, newSource, newIndex, oldContainerId = null, newContainerId = null) {
        for (const [key, ref] of Object.entries(this.equipment)) {
            if (ref && ref.sourceType === oldSource && ref.index === oldIndex) {
                // If it was in a container, verify the container ID matches
                if (oldSource === 'container' && ref.containerId !== oldContainerId) {
                    continue; 
                }

                if (newSource === null) {
                    // Item deleted/fully moved to nowhere? Unequip.
                    this.equipment[key] = null;
                    if (key === 'rightHand') this.owner.updateHandState();
                    this.updateVisuals(key, null, false);
                } else {
                    // Update reference
                    const newRef = { sourceType: newSource, index: newIndex };
                    if (newSource === 'container' && newContainerId) {
                        newRef.containerId = newContainerId;
                    }
                    this.equipment[key] = newRef;
                }
            }
        }
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

            const maxQty = parseInt(item.quantity || 1);
            let qtyToMove = (amount === null || amount === undefined) ? maxQty : parseInt(amount);
            if (isNaN(qtyToMove) || qtyToMove <= 0) qtyToMove = maxQty;
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
                    item.quantity -= qtyToMove;
                    if (item.quantity <= 0) {
                        fromArray[fIdx] = null;
                        this.updateEquipmentRefAfterMove(fromSource, fIdx, null, null, fromContainerId, null);
                    }
                }
            } else {
                if (targetItem.className === item.className && targetItem.name === item.name) {
                    const maxStack = 512; 
                    const space = maxStack - targetItem.quantity;
                    const actualMove = Math.min(qtyToMove, space);
                    
                    if (actualMove > 0) {
                        targetItem.quantity += actualMove;
                        item.quantity -= actualMove;
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
    }
};
