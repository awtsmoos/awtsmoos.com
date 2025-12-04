/**
 * B"H
 * @file customNpc.js
 * @description
 * In the Kabbalistic structure of the game, the CustomNpc represents a "Partzuf" - a distinct persona
 * created by the user (the local "Boreh" of this entity). 
 */

import Medabeir from "../chayim/medabeir.js";
import Utils from "../utils.js";

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
        const customData = op.itemData?.customData || {};
        
        op.name = customData.name || "Anonymous Soul";
        op.placeholderName = op.name;
        
        // B"H: Physics fix. They are not part of static world.
        op.isSolid = false; 
        
        op.path = customData.modelPath || "awtsmoos://awduhm";
        op.heesHawveh = true;

        super(op);
        
        // Ensure we have an ID for the editor to track
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
        
        // B"H: Initialize Message Tree Logic
        this.messageTree = (myself) => {
            if (!this.olam) {
                return [{ message: "Initializing...", responses: [] }];
            }

            const currentPlayerId = this.olam.chossid ? this.olam.chossid.name : "player";
            const isOwner = !this.ownerId || (this.ownerId === currentPlayerId);

            // Always pull fresh data from customData in case it was edited
            let dialogueTree = Utils.copyObj(this.customData.dialogueTree);

            // Ensure ID mapping for the tree array
            dialogueTree.forEach((node, index) => {
                if(node.id === undefined) node.id = index;
                if(node.responses) {
                     node.responses.forEach(r => {
                         if(r.type === "message" && r.target !== undefined) {
                             r.nextMessageIndex = r.target;
                         } else if (r.type === "close") {
                             r.close = "Shalom!";
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
                                    // Pass fresh serialization to editor
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

    openShopUI(buyer) {
        // Generate Shop Node dynamically
        const shopResponses = this.shopInventory.map((item, index) => ({
            text: `Buy ${item.name} (${item.price} coins) [${item.quantity} left]`,
            action: (me, buyer) => {
                this.sellItem(index, buyer);
            }
        }));

        shopResponses.push({ text: "Nevermind", close: "Come back soon!" });
        
        // Use Medabeir's special method to switch to a temporary tree node
        this.changeResponseAndGoToIt({
            message: "B\"H\nTake a look at what I have gathered.",
            responses: shopResponses
        });
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
        let hasFunds = false;
        const coinSlot = buyerInv.slots.find(s => s && s.className === 'Coin');
        
        if (coinSlot && coinSlot.quantity >= item.price) {
            hasFunds = true;
            buyerInv.consumeItem(coinSlot, item.price);
        }

        if(!hasFunds) {
            this.ayshPeula("close dialogue", "You do not have enough Perutahs (coins).");
            return;
        }
        
        const itemToAdd = {
            id: item.name.toLowerCase().replace(/\s/g, "_") + "_" + Date.now(),
            name: item.name,
            className: "Brick",
            quantity: 1,
            description: "Bought from " + this.name
        };

        if(buyer.inventory) {
            buyer.inventory.addItem(itemToAdd);
        }

        item.quantity--;
        if (item.quantity <= 0) {
            this.shopInventory.splice(index, 1);
        }

        const profit = item.price;
        const ownerShare = Math.floor(profit * (this.contractPercentage / 100));
        this.balance += ownerShare;
        this.salesLog.push(`Sold ${item.name} for ${item.price} (Owner gets ${ownerShare}) at ${new Date().toLocaleTimeString()}`);

        this.ayshPeula("close dialogue", "Thank you for your purchase!");
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