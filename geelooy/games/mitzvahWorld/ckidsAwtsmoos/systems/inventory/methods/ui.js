// B"H
/**
 * UI and Container logic for Inventory.
 * Ensures items are properly hydrated for the Main Thread UI.
 */

export default {
    openContainer(item, index, sourceType) {
        let realItem = null;
        if (sourceType === 'inventory' && this.slots[index]) {
            realItem = this.slots[index];
        } else if (sourceType === 'action' && this.actionSlots[index]) {
            realItem = this.actionSlots[index];
        } else if (sourceType === 'container' && this.activeContainer) {
             realItem = this.activeContainer.customData.slots[index];
        }
        
        if (!realItem) realItem = item;

        if (!realItem) return;
        
        if (!realItem.customData) realItem.customData = {};
        if (!realItem.customData.slots) {
             const defaultSize = 8;
             realItem.customData.slots = new Array(defaultSize).fill(null);
        }

        realItem.customData.slots = realItem.customData.slots.map(s => s ? this.enrichItemData(s) : null);
        
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
                 if (item && item.id && item.id.toLowerCase().includes(meshName.toLowerCase())) {
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
            const isContainer = itemData.isContainer || (itemData.customData && !!itemData.customData.slots);
            
            return {
                ...itemData,
                isContainer: isContainer,
                equipSlot: itemData.equipSlot || (itemData.className === 'Tool' || itemData.className === 'Brick' ? 'rightHand' : null)
            };
        };

        const equippedMap = new Map();
        for (const [slotName, ref] of Object.entries(this.equipment)) {
            if (ref) {
                let key = (ref.sourceType === 'container') ? 
                    `container-${ref.containerId}-${ref.index}` : 
                    `${ref.sourceType}-${ref.index}`;
                equippedMap.set(key, slotName);
            }
        }

        const formatWithEquippedStatus = async (slot, index, sourceType, containerId = null) => {
            if (!slot) return null;
            const formatted = await formatSlot(slot);
            let key = (sourceType === 'container') ? `container-${containerId}-${index}` : `${sourceType}-${index}`;

            if (equippedMap.has(key)) {
                formatted.isEquipped = true;
                formatted.equippedIn = equippedMap.get(key);
            }
            return formatted;
        };

        let visibleSlots = this.activeContainer ? this.activeContainer.customData.slots : this.slots;
        let sourceType = this.activeContainer ? 'container' : 'inventory';
        let containerName = this.activeContainer ? this.activeContainer.name : null;
        let activeContainerId = this.activeContainer ? this.activeContainer.id : null;

        const uiSlots = await Promise.all(visibleSlots.map((s, i) => formatWithEquippedStatus(s, i, sourceType, activeContainerId)));
        const uiActionSlots = await Promise.all(this.actionSlots.map((s, i) => formatWithEquippedStatus(s, i, 'action')));
        
        const uiEquipment = {};
        for (const [key, ref] of Object.entries(this.equipment)) {
            if (ref) {
                let item = null;
                if (ref.sourceType === 'inventory') item = this.slots[ref.index];
                else if (ref.sourceType === 'action') item = this.actionSlots[ref.index];
                else if (ref.sourceType === 'container') {
                    if (this.activeContainer && this.activeContainer.id === ref.containerId) {
                        item = this.activeContainer.customData.slots[ref.index];
                    } else {
                        const bag = this.slots.find(s => s && s.id === ref.containerId);
                        if (bag) item = bag.customData.slots[ref.index];
                    }
                }
                uiEquipment[key] = item ? await formatSlot(item) : null;
            } else { uiEquipment[key] = null; }
        }

        this.owner.olam.ayshPeula("ui event", "inventoryScreen", {
            updateSlots: { slots: uiSlots, containerMode: !!this.activeContainer, containerName },
            updateEquipment: uiEquipment,
            updateWallet: this.getWalletValue()
        });
        
        this.owner.olam.ayshPeula("ui event", "action bar", { updateActionSlots: uiActionSlots });
    }
};