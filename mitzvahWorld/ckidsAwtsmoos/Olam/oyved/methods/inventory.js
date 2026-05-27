


/**
 * B"H
 * Inventory Methods for Worker
 */
export default function(me) {
    return {
        async moveItem(data) {
            if (me.olam && me.olam.player && me.olam.player.inventory) {
                me.olam.player.inventory.moveItem(data);
            }
        },
        async moveToActionBar({ fromInventoryIndex, toActionIndex }) {
            if (me.olam && me.olam.player && me.olam.player.inventory) {
                me.olam.player.inventory.moveToActionBar(fromInventoryIndex, toActionIndex);
            }
        },
        async moveFromActionBar({ actionIndex }) {
            if (me.olam && me.olam.player && me.olam.player.inventory) {
                me.olam.player.inventory.moveFromActionBar(actionIndex);
            }
        },
        async saveSettings(data) {
            // Note: fetch works in worker. 'window' does not.
        },
        async equipItem(payload) {
            if (me.olam && me.olam.player && me.olam.player.inventory) {
                me.olam.player.inventory.equipItem(payload);
            }
        },
        async unequipItem(slotName) {
            if (me.olam && me.olam.player && me.olam.player.inventory) {
                me.olam.player.inventory.unequipItem(slotName);
            }
        },
        async addItem(itemData) {
            if (me.olam && me.olam.player && me.olam.player.inventory) {
                me.olam.player.inventory.addItem(itemData, itemData.quantity || 1);
            }
        },
        async updateInventoryItem({ sourceType, index, itemData }) {
             if (me.olam && me.olam.player && me.olam.player.inventory) {
                 me.olam.player.inventory.updateItem(sourceType, index, itemData);
             }
        },
        async selectInventorySlot({ index }) {
            if (me.olam && me.olam.player) {
                me.olam.player.selectedInventorySlot = index;
            }
        },
        async requestInventoryUpdate() {
            if (me.olam && me.olam.player && me.olam.player.inventory) {
                me.olam.player.inventory.updateUI();
            }
        },
        async sortInventory() {
            if (me.olam && me.olam.player && me.olam.player.inventory) {
                me.olam.player.inventory.sortInventory();
            }
        },
        // B"H: New direct handlers for container logic
        async openContainer(data) {
            const { item, index, sourceType } = data;
            if (me.olam && me.olam.player && me.olam.player.inventory) {
                me.olam.player.inventory.openContainer(item, index, sourceType);
            }
        },
        async closeContainer() {
            if (me.olam && me.olam.player && me.olam.player.inventory) {
                me.olam.player.inventory.closeContainer();
            }
        }
    };
}
