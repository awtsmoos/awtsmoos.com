/**
 * B"H
 * Manages inventory and equipment.
 */
import * as AWTSMOOS from "../awtsmoosCkidsGames.js";
import { CurrencySystem } from "../dvarim/coin.js"; 

export default class InventoryManager {
    constructor(owner) {
        this.owner = owner;
        this.slots = [];
        this.maxSlots = 36;
        
        this.actionSlots = [];
        this.maxActionSlots = 4;
        
        this.equipment = {
            head: null, jacket: null, legs: null, feet: null,
            rightHand: null, leftHand: null
        };

        this.init();
    }

    init() {
        for (let i = 0; i < this.maxSlots; i++) this.slots.push(null);
        for (let i = 0; i < this.maxActionSlots; i++) this.actionSlots.push(null);
    }
    
    save() {
        if (!this.owner || !this.owner.olam) return;
        if (this._saveTimeout) clearTimeout(this._saveTimeout);
        this._saveTimeout = setTimeout(() => {
            const saveData = {
                inventory: { slots: this.slots, equipment: this.equipment }
            };
            this.owner.olam.ayshPeula("saveSettings", saveData);
        }, 1000); 
    }
    
    getWalletValue() {
        let total = 0;
        const countSlot = (slot) => {
            if (slot && slot.className === 'Coin') {
                const val = slot.value || 1;
                total += val * slot.quantity;
            }
        };
        this.slots.forEach(countSlot);
        this.actionSlots.forEach(countSlot);
        return total;
    }

    deductCurrency(amount) {
        const currentTotal = this.getWalletValue();
        if (currentTotal < amount) return false;

        const newTotal = currentTotal - amount;
        const clearSlot = (slot, index, array) => {
            if (slot && slot.className === 'Coin') array[index] = null;
        };
        this.slots.forEach(clearSlot);
        this.actionSlots.forEach(clearSlot);

        const change = CurrencySystem.convert(newTotal);
        for (const [type, count] of Object.entries(change)) {
            const val = CurrencySystem.VALUES[type];
            this.addItem({
                id: 'coin_' + val + '_' + Date.now(),
                className: 'Coin',
                name: CurrencySystem.NAMES[val],
                value: val,
                quantity: count,
                icon: CurrencySystem.getBase64Icon(val),
                description: `Value: ${val} Perutahs`
            }, count);
        }
        this.updateUI();
        return true;
    }

    exchangeCurrency() { this.deductCurrency(0); }

    // B"H: Helper to ensure item data has defaults from its Class
    enrichItemData(itemData) {
        if (!itemData || !itemData.className) return itemData;
        
        const ItemClass = AWTSMOOS[itemData.className];
        if (ItemClass) {
            // Instantiate dummy to get instance properties (like sellValue)
            try {
                const tempInstance = new ItemClass({});
                
                if (itemData.sellValue === undefined) {
                    itemData.sellValue = tempInstance.sellValue || 0;
                }
                
                if (!itemData.name) itemData.name = ItemClass.itemName || tempInstance.name || itemData.className;
                if (!itemData.description) itemData.description = ItemClass.description || tempInstance.description || "";
                if (!itemData.icon) itemData.icon = ItemClass.icon || "";
                
                if (ItemClass.isBuildable) itemData.isBuildable = true;
            } catch (e) {
                console.warn("B\"H: Could not hydrate item class", itemData.className, e);
            }
        }
        
        // Special handling for Coins
        if (itemData.className === 'Coin') {
             if(!itemData.value) itemData.value = 1;
             itemData.icon = CurrencySystem.getBase64Icon(itemData.value);
             itemData.name = CurrencySystem.NAMES[itemData.value];
        }
        
        return itemData;
    }

    addItem(itemData, quantity = 1) {
        if (!itemData || !itemData.id || !itemData.className) return false;

        // B"H: Enrich data before adding
        const enhancedItemData = this.enrichItemData({ ...itemData });
        
        const itemClass = AWTSMOOS[enhancedItemData.className];
        const maxStack = itemClass ? (itemClass.stackSize || 512) : 512;
        const uniqueItemId = enhancedItemData.id; 

        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            if (slot && slot.id === uniqueItemId && slot.quantity < maxStack) {
                const canAdd = maxStack - slot.quantity;
                const toAdd = Math.min(quantity, canAdd);
                slot.quantity += toAdd;
                quantity -= toAdd;
                if (quantity <= 0) { this.updateUI(); this.save(); return true; }
            }
        }

        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] === null) {
                const toAdd = Math.min(quantity, maxStack);
                this.slots[i] = { ...enhancedItemData, quantity: toAdd };
                quantity -= toAdd;
                if (quantity <= 0) { this.updateUI(); this.save(); return true; }
            }
        }
        
        this.updateUI();
        return quantity > 0 ? false : true;
    }
    
    updateItem(sourceType, index, newItemData) {
        const sourceArray = sourceType === 'action' ? this.actionSlots : this.slots;
        if (index < 0 || index >= sourceArray.length) return;
        const existingItem = sourceArray[index];
        if (!existingItem) return;
        
        // Merge and re-enrich
        const updatedItem = this.enrichItemData({ ...existingItem, ...newItemData });
        
        sourceArray[index] = updatedItem;
        this.updateUI();
        this.save();
    }

    hydrateItems() {
        // B"H: Hydrate existing items on load
        this.slots = this.slots.map(item => item ? this.enrichItemData(item) : null);
        this.actionSlots = this.actionSlots.map(item => item ? this.enrichItemData(item) : null);
    }
    
    consumeItem(itemReference, amount = 1) {
        if (!itemReference) return;
        itemReference.quantity -= amount;
        if (itemReference.quantity <= 0) {
            const slotIndex = this.slots.indexOf(itemReference);
            if (slotIndex > -1) this.slots[slotIndex] = null;
            else {
                const actionIndex = this.actionSlots.indexOf(itemReference);
                if(actionIndex > -1) this.actionSlots[actionIndex] = null;
                else {
                    for (const [key, equippedRef] of Object.entries(this.equipment)) {
                        if (equippedRef) {
                            const source = equippedRef.sourceType === 'action' ? this.actionSlots : this.slots;
                            if (source[equippedRef.index] === itemReference) {
                                this.equipment[key] = null;
                                this.updateVisuals(key, itemReference, false);
                                break;
                            }
                        }
                    }
                }
            }
            this.owner.updateHandState();
        }
        this.updateUI();
        this.save();
    }

    removeItem(slotIndex, quantity = 1) {
        const slot = this.slots[slotIndex];
        if (slot) {
            slot.quantity -= quantity;
            if (slot.quantity <= 0) this.slots[slotIndex] = null;
            this.updateUI();
            this.save();
            return true;
        }
        return false;
    }
    
    updateVisuals(slotName, item, isEquipping) {
        if (this.owner.garments) {
            for (const [meshName, meshObj] of Object.entries(this.owner.garments)) {
                 if (item.id.toLowerCase().includes(meshName.toLowerCase())) {
                     meshObj.visible = isEquipping;
                 }
            }
        }
    }
    
    // B"H: Generic Move Item Logic supporting drag-and-drop and stacking
    moveItem({ fromSource, fromIndex, toSource, toIndex, amount }) {
        try {
            console.log("B\"H Inventory: moveItem START", { fromSource, fromIndex, toSource, toIndex, amount });

            const fromArray = fromSource === 'action' ? this.actionSlots : this.slots;
            const toArray = toSource === 'action' ? this.actionSlots : this.slots;
            
            // Validation - Explicit type conversion
            const fIdx = parseInt(fromIndex);
            const tIdx = parseInt(toIndex);
            
            if (!fromArray || !toArray) {
                 console.error("B\"H Inventory: Invalid Move Source/Dest Arrays. Aborting.", fromSource, toSource);
                 return;
            }
            if (isNaN(fIdx) || fIdx < 0 || fIdx >= fromArray.length) {
                console.warn("B\"H Inventory: Invalid From Index", fIdx);
                return;
            }
            if (isNaN(tIdx) || tIdx < 0 || tIdx >= toArray.length) {
                console.warn("B\"H Inventory: Invalid To Index", tIdx);
                return;
            }

            const item = fromArray[fIdx];
            if (!item) {
                 console.warn("B\"H Inventory: Attempted to move null item from", fromSource, fIdx);
                 return; 
            }

            // Determine Quantity - Robust Parsing
            const maxQty = parseInt(item.quantity || 1);
            // Fix: Handle null/undefined amount by defaulting to maxQty, otherwise parse
            let qtyToMove = (amount === null || amount === undefined) ? maxQty : parseInt(amount);
            
            if (isNaN(qtyToMove) || qtyToMove <= 0) qtyToMove = maxQty;
            if (qtyToMove > maxQty) qtyToMove = maxQty;

            console.log("B\"H Inventory: Moving Quantity", qtyToMove, "of", item.name);

            // Prevent move to same slot
            if (fromSource === toSource && fIdx === tIdx) {
                console.log("B\"H Inventory: Dropped on same slot, ignoring.");
                return;
            }

            const targetItem = toArray[tIdx];

            if (!targetItem) {
                // Case 1: Target is Empty
                console.log("B\"H Inventory: Target Slot is Empty.");
                
                // B"H FIX: Strict comparison causes issues if types differ. Use >= logic.
                // If we are moving equal to or more than what we have (which is maxQty), it's a full move.
                if (qtyToMove >= maxQty) {
                    // Full move - Copy Ref and Nullify Origin
                    console.log("B\"H Inventory: Performing Full Move.");
                    toArray[tIdx] = item; 
                    fromArray[fIdx] = null;
                    console.log("B\"H Inventory: Full Move Success");
                    // If item was equipped from old slot, update equipment reference
                    this.updateEquipmentRefAfterMove(fromSource, fIdx, toSource, tIdx);
                } else {
                    // Split
                    console.log("B\"H Inventory: Performing Split.");
                    const newItem = { ...item, quantity: qtyToMove, id: item.id + "_split_" + Date.now() };
                    // New item is not equipped by default
                    newItem.isEquipped = false;
                    delete newItem.equippedIn;
                    
                    toArray[tIdx] = newItem;
                    item.quantity -= qtyToMove;
                    
                    // B"H FIX: Clean up source if split drained it (sanity check)
                    if (item.quantity <= 0) {
                        console.log("B\"H Inventory: Source drained during split, clearing.");
                        fromArray[fIdx] = null;
                        this.updateEquipmentRefAfterMove(fromSource, fIdx, null, null);
                    }
                    
                    console.log("B\"H Inventory: Split Success. New Qty:", newItem.quantity, "Old Qty:", item.quantity);
                }
            } else {
                // Case 2: Target is Occupied
                console.log("B\"H Inventory: Target Slot Occupied by", targetItem.name);
                
                // Check for stacking (Same Class, Same Name)
                if (targetItem.className === item.className && targetItem.name === item.name) {
                    // Stack
                    console.log("B\"H Inventory: Attempting Stack.");
                    const ItemClass = AWTSMOOS[item.className];
                    const maxStack = ItemClass ? (ItemClass.stackSize || 512) : 512;
                    
                    const space = maxStack - targetItem.quantity;
                    const actualMove = Math.min(qtyToMove, space);
                    
                    if (actualMove > 0) {
                        targetItem.quantity += actualMove;
                        item.quantity -= actualMove;
                        console.log("B\"H Inventory: Stack Success. Moved:", actualMove);
                        if (item.quantity <= 0) {
                            fromArray[fIdx] = null;
                            this.updateEquipmentRefAfterMove(fromSource, fIdx, null, null); // Item gone
                        }
                    } else {
                        console.log("B\"H Inventory: Target Full (Max Stack).");
                    }
                } else {
                    // Swap (Only possible if moving full amount)
                    if (qtyToMove >= maxQty) {
                        console.log("B\"H Inventory: Swapping Items.");
                        toArray[tIdx] = item;
                        fromArray[fIdx] = targetItem;
                        console.log("B\"H Inventory: Swap Success");
                        
                        // Update equipment references for BOTH swapped items
                        this.updateEquipmentRefAfterMove(fromSource, fIdx, toSource, tIdx); 
                        this.updateEquipmentRefAfterMove(toSource, tIdx, fromSource, fIdx); 
                        
                        this.fixEquipmentReferences();
                    } else {
                        console.warn("B\"H Inventory: Cannot swap partial stack");
                    }
                }
            }
            
            console.log("B\"H Inventory: Updating UI and Saving.");
            this.updateUI();
            this.save();
        } catch(e) {
            console.error("B\"H Inventory Error in moveItem:", e);
            // Ensure UI is updated even on error to sync with real state
            this.updateUI();
        }
    }
    
    // Helper to fix equipment pointers after a swap or move
    fixEquipmentReferences() {
        // Iterate over all equipment slots
        // Since we only store {source, index}, if items swap, we don't need to do anything complex.
        // The item that lands in the equipped slot effectively becomes equipped.
    }
    
    updateEquipmentRefAfterMove(oldSource, oldIndex, newSource, newIndex) {
        for (const [key, ref] of Object.entries(this.equipment)) {
            if (ref && ref.sourceType === oldSource && ref.index === oldIndex) {
                if (newSource === null) {
                    // Item destroyed/gone
                    this.equipment[key] = null;
                    // Update owner visual state
                    if (key === 'rightHand') this.owner.updateHandState();
                } else {
                    // Point to new location
                    this.equipment[key] = { sourceType: newSource, index: newIndex };
                }
            }
        }
    }

    moveToActionBar(fromInventoryIndex, toActionIndex) {
        this.moveItem({
            fromSource: 'inventory',
            fromIndex: fromInventoryIndex,
            toSource: 'action',
            toIndex: toActionIndex
        });
    }
    
    moveFromActionBar(actionIndex) {
        // Find first empty slot
        const emptyIndex = this.slots.findIndex(s => s === null);
        if (emptyIndex !== -1) {
            this.moveItem({
                fromSource: 'action',
                fromIndex: actionIndex,
                toSource: 'inventory',
                toIndex: emptyIndex
            });
        }
    }

    isEquipped(sourceType, index) {
        for (const [slotName, ref] of Object.entries(this.equipment)) {
            if (ref && ref.sourceType === sourceType && ref.index === index) return slotName;
        }
        return null;
    }

    async updateUI() {
        if (!this.owner.olam || !this.owner.olam.ayshPeula) return;

        const formatSlot = async (slot) => {
            if (!slot) return null;
            
            // Ensure data is enriched before sending to UI (double check)
            const itemData = this.enrichItemData(slot);
            
            return {
                ...itemData,
                // Explicitly pass sellValue for the store
                sellValue: itemData.sellValue || 0,
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

        const uiSlots = await Promise.all(this.slots.map((s, i) => formatWithEquippedStatus(s, i, 'inventory')));
        const uiActionSlots = await Promise.all(this.actionSlots.map((s, i) => formatWithEquippedStatus(s, i, 'action')));
        
        const uiEquipment = {};
        for (const [key, ref] of Object.entries(this.equipment)) {
            if (ref) {
                const sourceArray = ref.sourceType === 'action' ? this.actionSlots : this.slots;
                uiEquipment[key] = await formatSlot(sourceArray[ref.index]);
            } else { uiEquipment[key] = null; }
        }

        this.owner.olam.ayshPeula("ui event", "inventoryScreen", {
            updateSlots: uiSlots,
            updateEquipment: uiEquipment,
            updateWallet: this.getWalletValue()
        });
        
        this.owner.olam.ayshPeula("ui event", "action bar", {
            updateActionSlots: uiActionSlots
        });
    }

    equipItem({ sourceType, index, target }) {
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
    }

    unequipItem(equipSlotName) {
	    const equippedRef = this.equipment[equipSlotName];
        if (!equippedRef) return;
        const sourceArray = equippedRef.sourceType === 'action' ? this.actionSlots : this.slots;
        const itemToUnequip = sourceArray[equippedRef.index];
        if (itemToUnequip) this.updateVisuals(equipSlotName, itemToUnequip, false);

        this.equipment[equipSlotName] = null;
        this.updateUI();
        this.save();
        if (equipSlotName === 'rightHand') this.owner.updateHandState();
    }
    
    sortInventory() {
        this.equipment = { head: null, jacket: null, legs: null, feet: null, rightHand: null, leftHand: null };

        this.slots.sort((a, b) => {
            if (!a && !b) return 0;
            if (!a) return 1; // Nulls last
            if (!b) return -1;
            return (a.name || "").localeCompare(b.name || "");
        });
        
        this.updateUI(); 
        this.save();
    }
}