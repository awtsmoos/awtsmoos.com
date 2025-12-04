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

    constructor(op, olam) {
        const customData = op.itemData?.customData || op.customData || {};
        
        op.name = customData.name || "Anonymous Soul";
        op.placeholderName = op.name;
        op.isSolid = false; 
        op.path = customData.modelPath || "awtsmoos://awduhm";
        op.heesHawveh = true;

        super(op);
        
        // B"H FIX: Manually assign olam because intermediate classes drop it
        if(olam) this.olam = olam;
        
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
        
        // B"H: Listen for Shop Actions from the UI
        if (this.olam) {
            this.olam.on("htmlPeula shopAction", (data) => {
                if (data.entityId === this.id) {
                    this.handleShopAction(data.action, data.payload, data.buyerName);
                }
            });
        }

        // B"H: Listen for nivraYotsee to close the store
        this.on("nivraYotsee", nivra => {
            if (nivra.type === 'chossid' && this.olam) {
                this.olam.ayshPeula("ui event", "storeScreen", { close: true });
            }
        });

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
                                    id: 'coin_1', className: 'Coin', name: 'Perutah', quantity: me.balance, value: 1
                                }, me.balance);
                                const amount = me.balance;
                                me.balance = 0;
                                me.ayshPeula("close dialogue", `Transferred ${amount} perutahs to you.`);
                                me.spawnHebrewParticles(me.mesh.position);
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

    openShopUI(buyer) {
        // B"H: Close any existing dialogue
        this.ayshPeula("close dialogue", "");
        
        // B"H: Open the Visual Store UI
        this.olam.ayshPeula("ui event", "storeScreen", {
            open: {
                mode: 'buy',
                entityId: this.id,
                npcName: this.name,
                items: this.shopInventory,
                playerInventory: buyer.inventory.slots
            }
        });
    }

    /**
     * B"H
     * Handles actions sent from the Store UI.
     */
    handleShopAction(action, payload, buyerName) {
        const buyer = this.olam.chossid; // Assume local player for now
        if (!buyer) return;
        
        if (action === 'buy') {
            this.processBuy(payload.index, buyer);
        } else if (action === 'sell') {
            this.processSell(payload.index, buyer);
        } else if (action === 'exchange') {
            buyer.inventory.exchangeCurrency();
            this.playSound("awtsmoos://dingSound", { volume: 0.6 });
            this.olam.ayshPeula("ui event", "effectsOverlay", { text: "Wallet Optimized!", color: "#00ff00" });
            this.refreshStoreUI(buyer);
        }
    }

    processBuy(index, buyer) {
        const item = this.shopInventory[index];
        if (!item) return;

        if (item.quantity <= 0) {
            this.olam.ayshPeula("ui event", "effectsOverlay", { text: "Out of Stock!", color: "red" });
            return;
        }

        const buyerInv = buyer.inventory;
        const walletValue = buyerInv.getWalletValue();

        if (walletValue >= item.price) {
            buyerInv.deductCurrency(item.price);

            const itemToAdd = {
                id: item.name.toLowerCase().replace(/\s/g, "_") + "_" + Date.now(),
                name: item.name,
                className: "Brick", 
                quantity: 1,
                description: "Bought from " + this.name,
                // B"H: Add random color if it's a brick
                customData: { color: Math.random() * 0xffffff }
            };
            buyerInv.addItem(itemToAdd);

            item.quantity--;
            if (item.quantity <= 0) {
                this.shopInventory.splice(index, 1);
            }

            const profit = item.price;
            const ownerShare = Math.floor(profit * (this.contractPercentage / 100));
            this.balance += ownerShare;
            this.salesLog.push(`Sold ${item.name} for ${item.price}`);

            this.playSound("awtsmoos://dingSound", { volume: 0.5 });
            this.olam.ayshPeula("ui event", "effectsOverlay", { 
                effect: 'transaction', 
                text: `-${item.price} P`,
                color: 'red',
                icon: item.name.charAt(0) // Simple icon placeholder
            });

            this.refreshStoreUI(buyer);
        } else {
            this.olam.ayshPeula("ui event", "effectsOverlay", { text: "Not enough funds!", color: "red" });
        }
    }

    processSell(slotIndex, buyer) {
        const slot = buyer.inventory.slots[slotIndex];
        if (!slot) return;
        
        const ItemClass = AWTSMOOS[slot.className];
        const value = slot.sellValue || (ItemClass ? new ItemClass({}).sellValue : 0);

        if (value > 0) {
            buyer.inventory.removeItem(slotIndex, 1);
            buyer.inventory.addItem({
                id: 'coin_1', className: 'Coin', name: 'Perutah', value: 1, quantity: value
            }, value);

            // Add to shop (optional markup logic could go here)
            this.shopInventory.push({
                name: slot.name,
                price: Math.ceil(value * 1.2),
                quantity: 1
            });

            this.playSound("awtsmoos://dingSound", { volume: 0.5 });
            this.olam.ayshPeula("ui event", "effectsOverlay", { 
                effect: 'transaction', 
                text: `+${value} P`,
                color: '#00ff00'
            });

            this.refreshStoreUI(buyer);
        }
    }

    refreshStoreUI(buyer) {
        this.olam.ayshPeula("ui event", "storeScreen", {
            update: {
                items: this.shopInventory,
                playerInventory: buyer.inventory.slots
            }
        });
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