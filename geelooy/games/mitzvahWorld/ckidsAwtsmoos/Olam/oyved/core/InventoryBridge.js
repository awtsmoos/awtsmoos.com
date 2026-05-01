/**
 * B"H
 * @file InventoryBridge.js
 * @module InventoryBridge
 * @description
 * 🎒 THE BRIDGE OF POSSESSIONS (OTZAR BRIT) 🎒
 * 
 * This module binds inventory action events from the UI (via olamPeula routing)
 * to the actual player inventory methods. Without this bridge, the inventory
 * actions (equip, unequip, move, etc.) are dispatched into the void — the Olam
 * receives the event name but has no handler registered to process it.
 * 
 * THE ROOT CAUSE OF THE BUG:
 * When the UI sends `ui.peula("ikar", { olamPeula: { unequipItem: 'shirt' } })`,
 * the UIManager's olamPeula listener extracts the payload and sends it via 
 * postMessage as `{ unequipItem: 'shirt' }`. The ContinuousEventRouter catches
 * the `olamPeula` wrapper and calls `olam.ayshPeula('unequipItem', 'shirt')`.
 * But if nobody called `olam.on('unequipItem', handler)`, that event fires
 * into absolute nothingness. This bridge fixes that.
 */

export class InventoryBridge {
    /**
     * @method bind
     * @description Registers all inventory event handlers on the Olam.
     * @param {Object} olam - The active world instance (Heeoolee descendant)
     */
    static bind(olam) {
        console.log('B"H - 🎒 [INVENTORY_BRIDGE]: Establishing the Covenant of Possessions.');

        /**
         * Helper to safely access the player's inventory
         */
        const getInventory = () => {
            if (olam && olam.player && olam.player.inventory) {
                return olam.player.inventory;
            }
            console.warn('B"H - ⚠️ [INVENTORY_BRIDGE]: Player inventory not yet initialized.');
            return null;
        };

        // ═══════════════════════════════════════════════
        // EQUIPMENT ACTIONS
        // ═══════════════════════════════════════════════
        
        olam.on("equipItem", (payload) => {
            const inv = getInventory();
            if (inv) {
                console.log('B"H - 🎒 [INVENTORY_BRIDGE]: equipItem', payload);
                inv.equipItem(payload);
            }
        });

        olam.on("unequipItem", (slotName) => {
            const inv = getInventory();
            if (inv) {
                console.log('B"H - 🎒 [INVENTORY_BRIDGE]: unequipItem', slotName);
                inv.unequipItem(slotName);
            }
        });

        // ═══════════════════════════════════════════════
        // MOVEMENT ACTIONS
        // ═══════════════════════════════════════════════

        olam.on("moveItem", (data) => {
            const inv = getInventory();
            if (inv) inv.moveItem(data);
        });

        olam.on("moveToActionBar", ({ fromInventoryIndex, toActionIndex }) => {
            const inv = getInventory();
            if (inv) inv.moveToActionBar(fromInventoryIndex, toActionIndex);
        });

        olam.on("moveFromActionBar", ({ actionIndex }) => {
            const inv = getInventory();
            if (inv) inv.moveFromActionBar(actionIndex);
        });

        // ═══════════════════════════════════════════════
        // ITEM MANAGEMENT ACTIONS
        // ═══════════════════════════════════════════════

        olam.on("addItem", (itemData) => {
            const inv = getInventory();
            if (inv) inv.addItem(itemData, itemData.quantity || 1);
        });

        olam.on("updateInventoryItem", ({ sourceType, index, itemData }) => {
            const inv = getInventory();
            if (inv) inv.updateItem(sourceType, index, itemData);
        });

        olam.on("selectInventorySlot", ({ index }) => {
            if (olam && olam.player) {
                olam.player.selectedInventorySlot = index;
            }
        });

        olam.on("requestInventoryUpdate", () => {
            const inv = getInventory();
            if (inv) inv.updateUI();
        });

        olam.on("sortInventory", () => {
            const inv = getInventory();
            if (inv) inv.sortInventory();
        });

        // ═══════════════════════════════════════════════
        // CONTAINER ACTIONS
        // ═══════════════════════════════════════════════

        olam.on("openContainer", (data) => {
            const inv = getInventory();
            if (inv) {
                const { item, index, sourceType } = data;
                inv.openContainer(item, index, sourceType);
            }
        });

        olam.on("closeContainer", () => {
            const inv = getInventory();
            if (inv) inv.closeContainer();
        });

        console.log('B"H - ✅ [INVENTORY_BRIDGE]: All 11 Inventory Decrees are now bound.');
    }
}
