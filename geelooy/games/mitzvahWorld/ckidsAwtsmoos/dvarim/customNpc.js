/**
 * B"H
 * @file customNpc.js
 * @description
 * In the Kabbalistic structure of the game, the CustomNpc represents a "Partzuf" - a distinct persona
 * created by the user (the local "Boreh" of this entity). 
 * 
 * Unlike the static "Domem" (mineral) or "Tzomayach" (vegetative), this entity is "Medabeir" (speaking).
 * It carries a "Shlichus" (mission) endowed by its creator: to communicate, to trade, and to exist dynamically.
 * 
 * It must possess:
 * 1. Keli (Vessel): The physical form (Mesh).
 * 2. Or (Light): The personality and dialogue.
 * 3. Ratzo V'Shov (Run and Return): The commerce logic - taking items, returning profit.
 */

import Medabeir from "../chayim/medabeir.js";
import Utils from "../utils.js";

export default class CustomNpc extends Medabeir {
    type = "customNpc";
    static itemName = "Custom NPC";
    static description = "A custom designed character.";
    static isBuildable = true; 
    
    // B"H: Explicit User Icon
    static icon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzRmNDRmNCI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==";
    
    // Store Properties
    shopInventory = [];
    balance = 0;
    contractPercentage = 100; // Default 100% goes to owner
    salesLog = [];
    ownerId = null; // The player who created this

    constructor(op) {
        // Hydrate from itemData if available (passed from Inventory item when placing)
        const customData = op.itemData?.customData || {};
        
        op.name = customData.name || "Anonymous Soul";
        op.placeholderName = op.name;
        
        // B"H: CRITICAL PHYSICS FIX
        // NPCs are dynamic "Chai" entities. They collide *against* the world,
        // they are NOT *part* of the static world geometry.
        op.isSolid = false; 
        
        // Default appearance - Using a safe default initially.
        // 'heescheel' will overwrite this with the player's path if available.
        op.path = customData.modelPath || "awtsmoos://awduhm";
        
        // B"H: Ensure physics/animation update loop runs
        op.heesHawveh = true;

        super(op);
        
        this.customData = customData;
        
        // B"H FIX: Ensure dialogueTree structure exists in data for serialization/editing
        if (!this.customData.dialogueTree || !Array.isArray(this.customData.dialogueTree) || this.customData.dialogueTree.length === 0) {
            this.customData.dialogueTree = [{ message: "B\"H\nShalom! I am a new soul in this world.", responses: [] }];
        }

        this.interactable = true;
        this.proximity = 3;
        
        // Hydrate Store Data
        this.shopInventory = customData.shopInventory || [];
        this.balance = customData.balance || 0;
        this.contractPercentage = customData.contractPercentage ?? 100;
        this.ownerId = customData.ownerId || null;
        this.salesLog = customData.salesLog || [];

        // Set initial velocity for "falling" effect upon creation
        this.velocity.y = -5; 
        
        // B"H: Initialize Message Tree Logic
        // We assign this to the property so the Medabeir getter picks it up as the function.
        this.messageTree = (myself) => {
            // B"H FIX: Safety check for constructor phase.
            if (!this.olam) {
                return [{ message: "Initializing...", responses: [] }];
            }

            // 1. Determine Identity
            const currentPlayerId = this.olam.chossid ? this.olam.chossid.name : "player";
            const isOwner = !this.ownerId || (this.ownerId === currentPlayerId);

            // 2. Load Standard Dialogue Tree (The "Neshama" of the NPC)
            // Use the ensured data from customData
            let dialogueTree = Utils.copyObj(this.customData.dialogueTree);

            // 3. Inject Shop Button (if inventory exists)
            // This applies to BOTH owners and strangers, so the owner can test/buy too.
            if (this.shopInventory.length > 0) {
                const rootNode = dialogueTree[0];
                if (!rootNode.responses) rootNode.responses = [];
                
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

            // 4. If Owner, Inject Management Options into the Root Node
            if (isOwner) {
                const rootNode = dialogueTree[0];
                if (!rootNode.responses) rootNode.responses = [];
                
                // Append Owner Actions
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
                        text: "⭐ View Sales Log",
                        action: (me) => {
                            const log = me.salesLog.length ? me.salesLog.slice(-5).join("\n") : "No sales yet.";
                            me.ayshPeula("close dialogue", `Sales Log (Last 5):\n${log}`);
                        }
                    },
                    {
                        text: "⭐ Collect Me (Return to Inventory)",
                        action: (me) => {
                             if (me.olam.player && me.olam.player.inventory) {
                                const serialized = me.serialize();
                                const itemData = serialized.itemData || {
                                    id: "custom_npc_" + Date.now(),
                                    className: "CustomNpc",
                                    name: me.name,
                                    customData: serialized.customData
                                };
                                me.olam.player.inventory.addItem(itemData);
                                me.ayshPeula("close dialogue", "Returning to source...");
                                console.log("B\"H: Returning soul to inventory", itemData.name);
                                setTimeout(() => {
                                    console.log("B\"H: Removing entity from world now.");
                                    me.olam.sealayk(me);
                                }, 500);
                            } else {
                                me.ayshPeula("close dialogue", "Error: Player inventory not found.");
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
                    }
                );
            }
            
            // 5. Fallback for empty responses
            if (!dialogueTree[0].responses || dialogueTree[0].responses.length === 0) {
                 dialogueTree[0].responses = [
                     { text: "Goodbye", close: "Shalom!" }
                 ];
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
        } else if (this.garments) {
	        var keys = Object.keys(this.garments);
	        keys.forEach(k => {
		        if(!this.garmentsDefault[k]) {
			        this.garments[k].visible = false;
		        }
	        })
        }
    }

    openShopUI(buyer) {
        const shopResponses = this.shopInventory.map((item, index) => ({
            text: `Buy ${item.name} (${item.price} coins) [${item.quantity} left]`,
            action: (me, buyer) => {
                this.sellItem(index, buyer);
            }
        }));

        shopResponses.push({ text: "Nevermind", close: "Come back soon!" });
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