
/**
 * B"H
 * UI and Container logic
 */

export default {
    openContainer(item, index, sourceType) {
        // B"H: silent

        
        let realItem = null;
        if (sourceType === 'inventory' && this.slots[index]) {
            realItem = this.slots[index];
        } else if (sourceType === 'action' && this.actionSlots[index]) {
            realItem = this.actionSlots[index];
        } else if (sourceType === 'container' && this.activeContainer) {
             realItem = this.activeContainer.customData.slots[index];
        }
        
        if (!realItem) {
            console.warn("B\"H Inventory: Could not find real item at index, using passed item copy.", index, sourceType);
            realItem = item;
        }

        if (!realItem) return;
        
        if (!realItem.customData) realItem.customData = {};
        
        if (!realItem.customData.slots) {
             // B"H: silent

             const defaultSize = 8;
             realItem.customData.slots = new Array(defaultSize).fill(null);
        }

        // B"H: Hydrate container contents immediately
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
            // B"H: Always enrich before sending to UI to ensure ICON IS PRESENT
            const itemData = this.enrichItemData(slot);
            const isContainer = itemData.className === 'Container' || itemData.isContainer || (itemData.customData && !!itemData.customData.slots);
            
            // B"H: Add visual cue for Quest Items description
            let description = itemData.description || '';
            if (itemData.isQuestItem) {
                description = "[QUEST ITEM] " + description;
            }

            return {
                ...itemData,
                description: description,
                sellValue: itemData.sellValue || 0,
                isContainer: isContainer,
                equipSlot: itemData.equipSlot || (itemData.className === 'Tool' || itemData.className === 'Brick' || itemData.className === 'CustomNpc' ? 'rightHand' : (itemData.className === 'Apparel' ? 'jacket' : null))
            };
        };

        const equippedMap = new Map();
        for (const [slotName, ref] of Object.entries(this.equipment)) {
            if (ref) {
                let key;
                if (ref.sourceType === 'container') {
                    key = `container-${ref.containerId}-${ref.index}`;
                } else {
                    key = `${ref.sourceType}-${ref.index}`;
                }
                equippedMap.set(key, slotName);
            }
        }

        const formatWithEquippedStatus = async (slot, index, sourceType, containerId = null) => {
            if (!slot) return null;
            const formatted = await formatSlot(slot);
            
            let key;
            if (sourceType === 'container') {
                 key = `container-${containerId}-${index}`;
            } else {
                 key = `${sourceType}-${index}`;
            }

            if (equippedMap.has(key)) {
                formatted.isEquipped = true;
                formatted.equippedIn = equippedMap.get(key);
            }
            return formatted;
        };

        let visibleSlots;
        let sourceType;
        let containerName = null;
        let activeContainerId = null;
        
        if (this.activeContainer) {
            visibleSlots = this.activeContainer.customData.slots;
            sourceType = 'container';
            containerName = this.activeContainer.name || "Container";
            activeContainerId = this.activeContainer.id;
        } else {
            visibleSlots = this.slots;
            sourceType = 'inventory';
        }

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
                        // Find the bag in main inventory
                        const bag = this.slots.find(s => s && s.id === ref.containerId);
                        if (bag && bag.customData && bag.customData.slots) {
                             item = bag.customData.slots[ref.index];
                        }
                    }
                }
                
                if (item) {
                     uiEquipment[key] = await formatSlot(item);
                } else {
                     uiEquipment[key] = null;
                }
            } else { uiEquipment[key] = null; }
        }

        // B"H: Bundle everything into the updateSlots payload so the UI handler receives all context
        this.owner.olam.ayshPeula("ui event", "inventoryScreen", {
            updateSlots: {
                slots: uiSlots,
                containerMode: !!this.activeContainer,
                containerName: containerName
            },
            updateEquipment: uiEquipment,
            updateWallet: this.getWalletValue()
        });
        
        this.owner.olam.ayshPeula("ui event", "action bar", {
            updateActionSlots: uiActionSlots
        });
    },

    showTooltip({ item, x, y }) {
        if (!item || !this.owner.olam) return;
        
        // B"H: Constructing the Rich Decree of Information
        this.owner.olam.ayshPeula("ui event", "icon tooltip", {
            classList: { remove: "hidden" },
            style: { left: (x + 15) + "px", top: (y + 15) + "px" },
            innerHTML: `
                <div class="tooltip-header">
                    <span class="tooltip-icon">${item.icon || '📦'}</span>
                    <span class="tooltip-name">${item.name || 'Unknown Sanctified Object'}</span>
                </div>
                <div class="tooltip-type">${item.className || 'Item'} ${item.equipSlot ? `(${item.equipSlot})` : ''}</div>
                <div class="tooltip-description">${item.description || 'A vessel of potential, awaiting its purpose in the world.'}</div>
                ${item.sellValue ? `<div class="tooltip-value">Redemption Value: ${item.sellValue} 🪙</div>` : ''}
                ${item.isEquipped ? `<div class="tooltip-type" style="color: #ffde40; margin-top: 5px;">Currently Manifested</div>` : ''}
            `
        });
    },

    hideTooltip() {
        if (!this.owner.olam) return;
        this.owner.olam.ayshPeula("ui event", "icon tooltip", {
            classList: { add: "hidden" }
        });
    }
};
