
/**
 * B"H
 * @module ShopSystem
 * @description
 * "Thou shalt buy for thyself..." 
 * Coordinates the exchange of value between the merchant soul and the player soul.
 */
export default class ShopSystem {
    /**
     * @function open
     * @description Triggers the opening of the UI Store Screen.
     */
    static open(npc, player) {
        if (!player || !player.inventory) return;
        
        const playerInventory = player.inventory.slots.map(s => player.inventory.enrichItemData(s));
        const shopInventory = (npc.shopInventory || []).map(s => player.inventory.enrichItemData(s));

        npc.olam.ayshPeula("ui event", "storeScreen", {
            open: {
                entityId: npc.id,
                npcName: npc.name,
                items: shopInventory,
                playerInventory: playerInventory
            }
        });
    }
}
