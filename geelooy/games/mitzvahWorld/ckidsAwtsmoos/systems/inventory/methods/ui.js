
/**
 * B"H
 * UI and Container logic
 */

export default {
    openContainer(item, index, sourceType) {
        // B"H: Retrieve the ACTUAL item from the inventory arrays.
        // 'item' passed from UI might be a detached copy or missing runtime data.
        let realItem = null;
        if (sourceType === 'inventory' && this.slots[index]) {
            realItem = this.slots[index];
        } else if (sourceType === 'action' && this.actionSlots[index]) {
            realItem = this.actionSlots[index];
        } else if (sourceType === 'container' && this.activeContainer) {
            // Nested containers not fully supported yet, but logic would go here
             realItem = this.activeContainer.customData.slots[index];
        }
        
        // Fallback to passed item if lookup fails (unlikely if indices are correct)
        // Note: Using the passed item directly might disconnect it from the inventory array if not careful,
        // but it's better than crashing.
        if (!realItem) realItem = item;
        
        if (!realItem) return;
        
        // Ensure slots structure exists on the REAL item
        if (!realItem.customData) realItem.customData = {};
        
        // B"H: Initialize slots if missing, defaulting to 8 if not specified
        if (!realItem.customData.slots) {
             const defaultSize = 8;
             realItem.customData.slots = new Array(defaultSize).fill(null);
        }
        
        this.activeContainer = realItem;
        this.updateUI();
    },
    
    closeContainer() {
        this.activeContainer = null;
        this.updateUI();
    },

    updateVisuals(slotName, item, isEquipping) {
        if (this.owner.updateAppearance) {
            this.owner.updateAppearance();
        } else if (this.owner.garments) {
            for (const [meshName, meshObj] of Object.entries(this.owner.garments)) {
                 if (item.id.toLowerCase().includes(meshName.toLowerCase())) {
                     meshObj.visible = isEquipping;
                 }
            }
        }
    },

    async updateUI() {
        if (!this.owner.olam || !this.owner.olam.ayshPeula) return;

        const formatSlot = async (slot) => {
            if (!slot) return null;
            const itemData = this.enrichItemData(slot);
            
            // Explicitly set isContainer here as a safeguard for the UI
            const isContainer = itemData.className === 'Container' || itemData.isContainer || (itemData.customData && !!itemData.customData.slots);
            
            return {
                ...itemData,
                sellValue: itemData.sellValue || 0,
                isContainer: isContainer,
                equipSlot: itemData.equipSlot || (itemData.className === 'Tool' || itemData.className === 'Brick' || itemData.className === 'CustomNpc' ? 'rightHand' : (itemData.className === 'Apparel' ? 'jacket' : null))
            };
        };

        const equippedMap = new Map();
        for (const [slotName, ref] of Object.entries(this.equipment)) {
            if (ref) {
                const key = `${ref.sourceType}-${ref.index}`;
                equippedMap.set(key, slotName);
            }
        }

        const formatWithEquippedStatus = async (slot, index, sourceType) => {
            if (!slot) return null;
            const formatted = await formatSlot(slot);
            const key = `${sourceType}-${index}`;
            if (equippedMap.has(key)) {
                formatted.isEquipped = true;
                formatted.equippedIn = equippedMap.get(key);
            }
            return formatted;
        };

        let visibleSlots;
        let sourceType;
        let containerName = null;
        
        if (this.activeContainer) {
            visibleSlots = this.activeContainer.customData.slots;
            sourceType = 'container';
            containerName = this.activeContainer.name || "Container";
        } else {
            visibleSlots = this.slots;
            sourceType = 'inventory';
        }

        const uiSlots = await Promise.all(visibleSlots.map((s, i) => formatWithEquippedStatus(s, i, sourceType)));
        const uiActionSlots = await Promise.all(this.actionSlots.map((s, i) => formatWithEquippedStatus(s, i, 'action')));
        
        const uiEquipment = {};
        for (const [key, ref] of Object.entries(this.equipment)) {
            if (ref) {
                const sourceArray = ref.sourceType === 'action' ? this.actionSlots : this.slots;
                if (ref.sourceType === 'inventory' || ref.sourceType === 'action') {
                     const item = sourceArray[ref.index];
                     if(item) {
                        uiEquipment[key] = await formatSlot(item);
                     } else {
                         uiEquipment[key] = null;
                     }
                } else {
                    uiEquipment[key] = null; 
                }
            } else { uiEquipment[key] = null; }
        }

        this.owner.olam.ayshPeula("ui event", "inventoryScreen", {
            updateSlots: uiSlots,
            updateEquipment: uiEquipment,
            updateWallet: this.getWalletValue(),
            containerMode: !!this.activeContainer,
            containerName: containerName
        });
        
        this.owner.olam.ayshPeula("ui event", "action bar", {
            updateActionSlots: uiActionSlots
        });
    }
};
