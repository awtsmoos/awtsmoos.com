
/**
 * B"H
 * @module MovementCore
 */
export default {
    getSourceArray(sourceType) {
        if (sourceType === 'action') return this.actionSlots;
        if (sourceType === 'inventory') return this.slots;
        if (sourceType === 'container') return this.activeContainer ? this.activeContainer.customData.slots : null;
        return null;
    },

    /**
     * @function updateEquipmentRefAfterMove
     * @description Recalibrates the soul's garments when the physical vessels shift positions.
     */
    updateEquipmentRefAfterMove(oldSource, oldIdx, newSource, newIdx, oldContId = null, newContId = null) {
        for (const [key, ref] of Object.entries(this.equipment)) {
            if (ref && ref.sourceType === oldSource && ref.index === oldIdx) {
                if (oldSource === 'container' && ref.containerId !== oldContId) continue; 

                if (newSource === null) {
                    this.equipment[key] = null;
                    this.updateVisuals(key, null, false);
                    if (key === 'rightHand') this.owner.updateHandState();
                } else {
                    this.equipment[key] = { sourceType: newSource, index: newIdx, containerId: newContId };
                }
            }
        }
    },

    moveItem({ fromSource, fromIndex, toSource, toIndex, amount }) {
        try {
            const fromArr = this.getSourceArray(fromSource);
            const toArr = this.getSourceArray(toSource);
            if (!fromArr || !toArr) return;

            const fIdx = parseInt(fromIndex);
            const tIdx = parseInt(toIndex);
            if (isNaN(fIdx) || isNaN(tIdx)) return;

            const item = fromArr[fIdx];
            if (!item) return;

            const fContId = fromSource === 'container' && this.activeContainer ? this.activeContainer.id : null;
            const tContId = toSource === 'container' && this.activeContainer ? this.activeContainer.id : null;

            const maxQty = item.quantity || 1;
            let qtyMove = (amount === null || amount === undefined) ? maxQty : parseInt(amount);
            qtyMove = Math.min(qtyMove, maxQty);

            if (fromSource === toSource && fIdx === tIdx) return;

            const target = toArr[tIdx];

            if (!target) {
                // 1. Move into empty space
                if (qtyMove >= maxQty) {
                    toArr[tIdx] = item; 
                    fromArr[fIdx] = null;
                    this.updateEquipmentRefAfterMove(fromSource, fIdx, toSource, tIdx, fContId, tContId);
                } else {
                    // Split stack
                    toArr[tIdx] = { ...item, quantity: qtyMove, id: item.id + "_split_" + Date.now(), isEquipped: false };
                    item.quantity -= qtyMove;
                }
            } else {
                // 2. Swapping or Stacking
                if (target.className === item.className && target.name === item.name) {
                    const stack = 1024;
                    const canAdd = Math.min(qtyMove, stack - target.quantity);
                    if (canAdd > 0) {
                        target.quantity += canAdd;
                        item.quantity -= canAdd;
                        if (item.quantity <= 0) {
                            fromArr[fIdx] = null;
                            this.updateEquipmentRefAfterMove(fromSource, fIdx, toSource, tIdx, fContId, tContId);
                        }
                    }
                } else if (qtyMove >= maxQty) {
                    // Direct Swap
                    toArr[tIdx] = item;
                    fromArr[fIdx] = target;
                    this.updateEquipmentRefAfterMove(fromSource, fIdx, toSource, tIdx, fContId, tContId);
                    this.updateEquipmentRefAfterMove(toSource, tIdx, fromSource, fIdx, tContId, fContId);
                }
            }
            this.updateUI();
            this.save();
        } catch(e) {
            console.error("B\"H - Move failed:", e);
            this.updateUI();
        }
    }
};
