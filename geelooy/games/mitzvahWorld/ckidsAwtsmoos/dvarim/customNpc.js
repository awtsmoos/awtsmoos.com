/**
 * B"H
 * @file customNpc.js
 * @description
 * In the Kabbalistic structure of the game, the CustomNpc represents a "Partzuf" - a distinct persona
 * created by the user (the local "Boreh" of this entity). 
 */

import Medabeir from "../chayim/medabeir.js";
import Utils from "../utils.js";
import { CurrencySystem } from "./coin.js";
import * as AWTSMOOS from "../awtsmoosCkidsGames.js";

export default class CustomNpc extends Medabeir {
    type = "customNpc";
    static itemName = "Custom NPC";
    static description = "A custom designed character.";
    static isBuildable = true; 
    
    static icon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzRmNDRmNCI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==";
    
    shopInventory = [];
    balance = 0;
    contractPercentage = 100; 
    salesLog = [];
    ownerId = null; 

    constructor(op) {
        const customData = op.itemData?.customData || op.customData || {};
        
        op.name = customData.name || "Anonymous Soul";
        op.placeholderName = op.name;
        op.isSolid = false; 
        op.path = customData.modelPath || "awtsmoos://awduhm";
        op.heesHawveh = true;

        super(op);
        
        if(!this.id) this.id = op.id || Utils.generateID();

        this.customData = customData;
        
        if (!this.customData.dialogueTree || !Array.isArray(this.customData.dialogueTree) || this.customData.dialogueTree.length === 0) {
            this.customData.dialogueTree = [{ message: "B\"H\nShalom! I am a new soul in this world.", responses: [] }];
        }

        this.interactable = true;
        this.proximity = 3;
        
        this.shopInventory = customData.shopInventory || [];
        this.balance = customData.balance || 0;
        this.contractPercentage = customData.contractPercentage ?? 100;
        this.ownerId = customData.ownerId || null;
        this.salesLog = customData.salesLog || [];

        this.velocity.y = -5; 
        
        this.messageTree = (myself) => {
            if (!this.olam) {
                return [{ message: "Initializing...", responses: [] }];
            }

            const currentPlayerId = this.olam.chossid ? this.olam.chossid.name : "player";
            const isOwner = !this.ownerId || (this.ownerId === currentPlayerId);

            let dialogueTree = Utils.copyObj(this.customData.dialogueTree);

            dialogueTree.forEach((node, index) => {
                if(node.id === undefined) node.id = index;
                if(node.responses) {
                     node.responses.forEach(r => {
                         if(r.type === "message" && r.target !== undefined) {
                             r.nextMessageIndex = r.target;
                         } else if (r.type === "close") {
                             r.close = "Shalom!";
                         } else if (r.type === "store") {
                             r.action = (me, buyer) => {
                                this.openShopUI(buyer);
                                return false;
                             }
                         }
                     });
                }
            });

            const rootNode = dialogueTree[0];
            if (!rootNode.responses) rootNode.responses = [];
            
            if (this.shopInventory.length > 0) {
                if(!rootNode.responses.find(r => r.isShopButton)) {
                    rootNode.responses.push({
                        text: "Show me your wares",
                        isShopButton: true,
                        action: (me, buyer) => {
                            this.openShopUI(buyer);
                            return false; 
                        }
                    });
                }
            }

            if (isOwner) {
                rootNode.responses.push(
                    {
                        text: "⭐ Collect Profits",
                        action: (me) => {
                            if (me.balance > 0) {
                                me.olam.player.inventory.addItem({
                                    id: 'coin', className: 'Coin', name: 'Perutah', quantity: me.balance
                                }, me.balance);
                                const amount = me.balance;
                                me.balance = 0;
                                me.ayshPeula("close dialogue", `Transferred ${amount} coins to you.`);
                            } else {
                                me.ayshPeula("close dialogue", "No profits to collect yet.");
                            }
                        }
                    },
                    {
                        text: "⭐ Edit Dialogue/Settings",
                        action: (me) => {
                            me.olam.ayshPeula("ui event", "character designer", {
                                open: { 
                                    mode: 'edit',
                                    item: { customData: me.serialize().customData, name: me.name },
                                    liveEntityId: me.id, 
                                    sourceType: 'world'
                                }
                            });
                            me.ayshPeula("close dialogue", "Opening editor...");
                        }
                    },
                    {
                        text: "⭐ Collect Me",
                        action: (me) => {
                             if (me.olam.player && me.olam.player.inventory) {
                                const serialized = me.serialize();
                                const itemData = serialized.itemData;
                                me.olam.player.inventory.addItem(itemData);
                                me.ayshPeula("close dialogue", "Returning to source...");
                                setTimeout(() => {
                                    me.olam.sealayk(me);
                                }, 500);
                            }
                        }
                    }
                );
            }
            
            if (dialogueTree[0].responses.length === 0) {
                 dialogueTree[0].responses = [{ text: "Goodbye", close: "Shalom!" }];
            }

            return dialogueTree;
        };
    }

    async heescheel(olam) {
        const player = olam.player || olam.chossid;
        const currentPathValid = this.path && olam.getComponent(this.path);
        
        if (!currentPathValid || this.path === "awtsmoos://new_awduhm") {
            if (player && player.path) {
                this.path = player.path;
            } else {
                this.path = "awtsmoos://awduhm";
            }
        }

        await super.heescheel(olam);
        this.isReady = true; 
        
        if (player && player.garments && this.garments) {
             for(const [garmentName, playerMesh] of Object.entries(player.garments)) {
                 if (this.garments[garmentName]) {
                     this.garments[garmentName].visible = playerMesh.visible;
                 }
             }
        }
    }

    /**
     * B"H
     * Opens the main shop hub.
     */
    openShopUI(buyer) {
        const responses = [
            {
                text: "Buy Items",
                action: () => { this.openBuyUI(buyer); return false; }
            },
            {
                text: "Sell Items",
                action: () => { this.openSellUI(buyer); return false; }
            },
            {
                text: "Exchange Currency (Make Change)",
                action: () => { this.openExchangeUI(buyer); return false; }
            },
            {
                text: "Goodbye",
                close: "Shalom!"
            }
        ];

        this.changeResponseAndGoToIt({
            message: "B\"H\nWelcome to the store. What would you like to do?",
            responses: responses
        });
    }

    openBuyUI(buyer) {
        const shopResponses = this.shopInventory.map((item, index) => ({
            text: `Buy ${item.name} (${item.price} perutahs) [${item.quantity} left]`,
            action: (me, buyer) => {
                this.sellItem(index, buyer);
            }
        }));

        shopResponses.push({ text: "Back", action: () => { this.openShopUI(buyer); return false; } });
        
        this.changeResponseAndGoToIt({
            message: "B\"H\nTake a look at what I have gathered.",
            responses: shopResponses
        });
    }

    openSellUI(buyer) {
        const buyerInv = buyer.inventory;
        const sellableResponses = [];

        // Scan player inventory for items with value
        buyerInv.slots.forEach((slot, index) => {
            if(!slot) return;
            
            // Get base class to check static properties if needed, or instance properties
            const ItemClass = AWTSMOOS[slot.className];
            const value = slot.sellValue || (ItemClass ? new ItemClass({}).sellValue : 0);

            if(value > 0 && slot.className !== 'Coin') {
                 sellableResponses.push({
                     text: `Sell ${slot.name} for ${value} perutahs`,
                     action: () => {
                         this.buyItemFromPlayer(index, value, buyer);
                         return false;
                     }
                 });
            }
        });

        if(sellableResponses.length === 0) {
            this.changeResponseAndGoToIt({
                message: "You don't have anything I want to buy right now.",
                responses: [{ text: "Back", action: () => { this.openShopUI(buyer); return false; } }]
            });
            return;
        }

        sellableResponses.push({ text: "Back", action: () => { this.openShopUI(buyer); return false; } });

        this.changeResponseAndGoToIt({
            message: "I can buy these from you:",
            responses: sellableResponses
        });
    }

    openExchangeUI(buyer) {
        const inv = buyer.inventory;
        const walletValue = inv.getWalletValue();
        
        const responses = [
            {
                text: "Consolidate Coins (Convert to largest possible coins)",
                action: () => {
                    inv.exchangeCurrency(); 
                    this.ayshPeula("close dialogue", "Your wallet has been optimized!");
                    return false;
                }
            },
            { text: "Back", action: () => { this.openShopUI(buyer); return false; } }
        ];

        this.changeResponseAndGoToIt({
            message: `You have ${walletValue} total value in Perutahs.\nI can help you exchange small coins for large ones (or vice versa, automatically).`,
            responses: responses
        });
    }

    buyItemFromPlayer(slotIndex, value, buyer) {
        const item = buyer.inventory.slots[slotIndex];
        if(!item) return;

        // Remove item from player
        buyer.inventory.removeItem(slotIndex, 1);

        // B"H: Give money to player
        // Use 'coin_1' (Perutah) to ensure it stacks correctly with other single coins
        buyer.inventory.addItem({
            id: 'coin_1', className: 'Coin', name: 'Perutah', value: 1, quantity: value
        }, value);

        // Feedback sound
        this.playSound("awtsmoos://dingSound", { volume: 0.5 });

        // Add to shop inventory (optional, but nice for persistence)
        this.shopInventory.push({
            name: item.name,
            price: Math.ceil(value * 1.2), // Mark up price for resale
            quantity: 1
        });

        this.openSellUI(buyer); // Refresh list
    }

    sellItem(index, buyer) {
        const item = this.shopInventory[index];
        if (!item) return;

        if (item.quantity <= 0) {
            this.ayshPeula("close dialogue", "Sorry, that item is out of stock.");
            this.shopInventory.splice(index, 1);
            return;
        }

        const buyerInv = buyer.inventory;
        const walletValue = buyerInv.getWalletValue();

        if (walletValue >= item.price) {
            // 1. Deduct Cost
            buyerInv.deductCurrency(item.price);

            // 2. Add Item
            const itemToAdd = {
                id: item.name.toLowerCase().replace(/\s/g, "_") + "_" + Date.now(),
                name: item.name,
                className: "Brick", // Default class if unknown, ideally store class in shop data
                quantity: 1,
                description: "Bought from " + this.name
            };
            buyerInv.addItem(itemToAdd);

            // 3. Update Shop
            item.quantity--;
            if (item.quantity <= 0) {
                this.shopInventory.splice(index, 1);
            }

            // 4. Update NPC Profit
            const profit = item.price;
            const ownerShare = Math.floor(profit * (this.contractPercentage / 100));
            this.balance += ownerShare;
            this.salesLog.push(`Sold ${item.name} for ${item.price} (Owner gets ${ownerShare}) at ${new Date().toLocaleTimeString()}`);

            this.playSound("awtsmoos://dingSound", { volume: 0.5 });
            this.openBuyUI(buyer); // Refresh
        } else {
            this.changeResponseAndGoToIt({
                message: "You don't have enough Perutahs!",
                responses: [{ text: "Back", action: () => { this.openShopUI(buyer); return false; } }]
            });
        }
    }

    serialize() {
        const base = super.serialize();
        base.customData = {
            name: this.name,
            color: this.customData.color,
            dialogueTree: this.customData.dialogueTree,
            shopInventory: this.shopInventory,
            balance: this.balance,
            contractPercentage: this.contractPercentage,
            salesLog: this.salesLog,
            ownerId: this.ownerId,
            modelPath: this.path
        };
        
        base.itemData = {
            id: this.name + "_" + Date.now(),
            className: "CustomNpc",
            name: this.name,
            customData: base.customData
        };
        return base;
    }
}