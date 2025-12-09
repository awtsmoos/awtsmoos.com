
/**
 * B"H
 * Item movement and equipment logic
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
                    this.updateEquipmentRefAfterMove(fromSource, fIdx, toSource, tIdx);
                } else {
                    const newItem = { ...item, quantity: qtyToMove, id: item.id + "_split_" + Date.now() };
                    newItem.isEquipped = false;
                    delete newItem.equippedIn;
                    toArray[tIdx] = newItem;
                    item.quantity -= qtyToMove;
                    if (item.quantity <= 0) {
                        fromArray[fIdx] = null;
                        this.updateEquipmentRefAfterMove(fromSource, fIdx, null, null);
                    }
                }
            } else {
                if (targetItem.className === item.className && targetItem.name === item.name) {
                    // Stacking logic requires we know stack size. Assuming max 512 for now or enrichment handles it.
                    const maxStack = 512; 
                    const space = maxStack - targetItem.quantity;
                    const actualMove = Math.min(qtyToMove, space);
                    
                    if (actualMove > 0) {
                        targetItem.quantity += actualMove;
                        item.quantity -= actualMove;
                        if (item.quantity <= 0) {
                            fromArray[fIdx] = null;
                            this.updateEquipmentRefAfterMove(fromSource, fIdx, null, null);
                        }
                    }
                } else {
                    if (qtyToMove >= maxQty) {
                        toArray[tIdx] = item;
                        fromArray[fIdx] = targetItem;
                        this.updateEquipmentRefAfterMove(fromSource, fIdx, toSource, tIdx); 
                        this.updateEquipmentRefAfterMove(toSource, tIdx, fromSource, fIdx); 
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
    
    updateEquipmentRefAfterMove(oldSource, oldIndex, newSource, newIndex) {
        for (const [key, ref] of Object.entries(this.equipment)) {
            if (ref && ref.sourceType === oldSource && ref.index === oldIndex) {
                if (newSource === null) {
                    this.equipment[key] = null;
                    if (key === 'rightHand') this.owner.updateHandState();
                    this.updateVisuals(key, null, false);
                } else {
                    this.equipment[key] = { sourceType: newSource, index: newIndex };
                }
            }
        }
        if (newSource === 'container') {
             for (const [key, ref] of Object.entries(this.equipment)) {
                if (ref && ref.sourceType === oldSource && ref.index === oldIndex) {
                    this.equipment[key] = null;
                    this.updateVisuals(key, null, false);
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
        if (sourceType === 'container') {
            console.warn("B\"H: Equipping from container not supported yet.");
            return;
        }
        
        const sourceArray = sourceType === 'action' ? this.actionSlots : this.slots;
        const itemToEquip = sourceArray[index];
        if (!itemToEquip || !target) return;

        const currentEquippedRef = this.equipment[target];
        if (currentEquippedRef) {
             const oldSource = currentEquippedRef.sourceType === 'action' ? this.actionSlots : this.slots;
             const oldItem = oldSource[currentEquippedRef.index];
             if(oldItem) this.updateVisuals(target, oldItem, false);
        }
        
        this.equipment[target] = { sourceType, index };
        this.updateVisuals(target, itemToEquip, true);
        this.updateUI();
        this.save();
        if (target === 'rightHand') this.owner.updateHandState();
    },

    unequipItem(equipSlotName) {
	    const equippedRef = this.equipment[equipSlotName];
        if (!equippedRef) return;
        
        if (equippedRef.sourceType === 'inventory' || equippedRef.sourceType === 'action') {
            const sourceArray = equippedRef.sourceType === 'action' ? this.actionSlots : this.slots;
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
