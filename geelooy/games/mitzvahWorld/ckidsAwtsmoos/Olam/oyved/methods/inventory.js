
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
        async openContainer(payload) {
             if (me.olam && me.olam.player && me.olam.player.inventory) {
                me.olam.player.inventory.openContainer(payload.item, payload.index, payload.sourceType);
            }
        },
        async closeContainer() {
             if (me.olam && me.olam.player && me.olam.player.inventory) {
                me.olam.player.inventory.closeContainer();
            }
        },
        async sortInventory() {
             if (me.olam && me.olam.player && me.olam.player.inventory) {
                me.olam.player.inventory.sortInventory();
            }
        },
        async requestInventoryUpdate() {
             if (me.olam && me.olam.player && me.olam.player.inventory) {
                me.olam.player.inventory.updateUI();
            }
        },
        
        // B"H: THE SHOP LOGIC
        async shopAction(data) {
            const { action, payload, entityId } = data;
            const player = me.olam.player;
            if (!player || !player.inventory) return;

            // Find the Shopkeeper (Medabeir/CustomNpc)
            const shopkeeper = me.olam.nivrayim.find(n => n.id === entityId);
            if (!shopkeeper || !shopkeeper.shopInventory) {
                me.olam.ayshPeula("ui event", "effectsOverlay", { text: "Shopkeeper missing!", color: "red" });
                return;
            }

            if (action === 'buy') {
                const shopItem = shopkeeper.shopInventory[payload.index];
                if (!shopItem) return;

                const price = shopItem.price || 10;
                // Calculate Tax (e.g. 10%)
                const tax = Math.ceil(price * 0.1);
                const totalCost = price + tax;

                // Check Balance
                if (player.inventory.deductCurrency(totalCost)) {
                    // Success - Add Item
                    const success = player.inventory.addItem({
                        ...shopItem,
                        id: shopItem.name.replace(/\s/g,'_') + "_" + Date.now(),
                        // Remove shop-specific props so they don't carry over weirdly
                        originalIndex: undefined,
                        type: undefined
                    });

                    if (!success) {
                        // Inventory Full - Refund!
                        // B"H: Simple refund by adding coins back.
                        // Ideally we use a dedicated refund method, but addItem works for coins.
                        player.inventory.addItem({ className:"Coin", value:1 }, totalCost); 
                        me.olam.ayshPeula("ui event", "effectsOverlay", { text: "Inventory Full!", color: "red" });
                    } else {
                        me.olam.ayshPeula("ui event", "effectsOverlay", { 
                            text: "Bought " + shopItem.name, 
                            color: "#00ff00",
                            effect: "transaction" 
                        });
                        me.olam.playSound("awtsmoos://dingSound");
                        
                        // Shopkeeper gets the base price (simulated economy)
                        shopkeeper.balance = (shopkeeper.balance || 0) + price;
                    }
                } else {
                    me.olam.ayshPeula("ui event", "effectsOverlay", { text: "Not enough funds!", color: "red" });
                }

            } else if (action === 'sell') {
                // Selling Logic
                const invItem = player.inventory.slots[payload.index];
                if (!invItem) return;
                
                const sellValue = invItem.sellValue || 1;
                
                // Remove item
                if (player.inventory.removeItem(payload.index, 1)) {
                    // Add coins
                    // Tax on sales? Usually shopkeeper takes a cut. 
                    // Let's say player gets full sellValue, shopkeeper pays.
                    
                    // Add coins to player
                    // Convert sellValue to coin items
                    // We assume 1 Coin = 1 Value for simplicity in add loop
                    // Actually use the CurrencySystem conversion if available, or just raw adds
                    // Using raw loop for now as CurrencySystem is in DOM context usually, 
                    // but we have it imported in items.js, so we can assume we rely on addItem handling it?
                    // Better: player.inventory.addItem(Coin, amount)
                    
                    // Just adding Perutahs (value=1)
                    player.inventory.addItem({
                        id: "coin_1_" + Date.now(),
                        className: "Coin",
                        name: "Perutah",
                        value: 1,
                        icon: "" // Will be auto-filled by enrich
                    }, sellValue);

                    me.olam.ayshPeula("ui event", "effectsOverlay", { 
                        text: "Sold for " + sellValue, 
                        color: "gold",
                        effect: "transaction"
                    });
                    me.olam.playSound("awtsmoos://dingSound");
                }
            } else if (action === 'exchange') {
                // Exchange Currency (Consolidate small coins into big ones)
                player.inventory.exchangeCurrency();
                me.olam.ayshPeula("ui event", "effectsOverlay", { text: "Currency Exchanged!", color: "#00ffff" });
            }
        }
    };
}
