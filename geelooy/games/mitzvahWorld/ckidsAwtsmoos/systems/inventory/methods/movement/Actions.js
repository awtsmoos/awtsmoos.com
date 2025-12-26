
// B"H
export default {
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
