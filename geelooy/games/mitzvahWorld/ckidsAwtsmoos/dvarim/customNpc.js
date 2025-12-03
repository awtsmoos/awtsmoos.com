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
    static isBuildable = true; // B"H: Allow placement in the world via the Ray
    
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
        
        // Default appearance - The Player Model
        op.path = customData.modelPath || "awtsmoos://new_awduhm";
        
        super(op);
        
        this.customData = customData;
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
        
        // Animation Mapping specifically for new_awduhm
        this.chaweeyoosMap = {
            run: "run",
            idle: "idle", // or "stand"
            walk: "walk",
            jump: "jump",
            falling: "falling", 
            "right turn": "right turn",
            "left turn": "left turn",
            "dance silly": "dance silly"
        };
    }

    /**
     * B"H
     * Determines the dialogue tree based on the soul standing before it.
     * If the Owner approaches, it reveals the "Pnimiyus" (Inner management).
     * If a Stranger approaches, it reveals the "Chitzoniyus" (Outer commerce/dialogue).
     */
    messageTree(myself) {
        // 1. Owner Interaction (Management)
        // Check if the interactor is the owner.
        // We use `this.olam.player` as the current player.
        const currentPlayerId = this.olam.chossid ? this.olam.chossid.name : "player";
        const isOwner = !this.ownerId || (this.ownerId === currentPlayerId);

        if (isOwner) {
            return [
                {
                    message: `B"H\nGreetings, my Creator. I have earned ${this.balance} coins.`,
                    responses: [
                        {
                            text: "Collect Profits",
                            action: (me) => {
                                if (me.balance > 0) {
                                    // Transfer funds to player
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
                            text: "View Sales Log",
                            action: (me) => {
                                const log = me.salesLog.length ? me.salesLog.slice(-5).join("\n") : "No sales yet.";
                                me.ayshPeula("close dialogue", `Sales Log (Last 5):\n${log}`);
                            }
                        },
                        {
                            text: "Return to Inventory (Collect Me)",
                            action: (me) => {
                                me.collectObject(); // Self-collection
                                me.ayshPeula("close dialogue", "Returning to source...");
                            }
                        },
                        {
                            text: "Edit Dialogue/Settings",
                            action: (me) => {
                                // Trigger UI event to open editor for THIS entity
                                me.olam.ayshPeula("ui event", "character designer", {
                                    open: { 
                                        mode: 'edit',
                                        item: { customData: me.serialize().customData, name: me.name },
                                        // We need a way to reference this live entity in the update callback
                                        liveEntity: me 
                                    }
                                });
                                me.ayshPeula("close dialogue", "Opening editor...");
                            }
                        },
                        {
                            text: "Goodbye",
                            close: "See you soon!"
                        }
                    ]
                }
            ];
        }

        // 2. Stranger Interaction (Shop & Default Dialogue)
        const dialogueTree = this.customData && this.customData.dialogueTree ? 
                             Utils.copyObj(this.customData.dialogueTree) : 
                             [{ message: "B\"H\nShalom.", responses: [] }];

        // Inject "View Shop" option into the first node if inventory exists
        if (this.shopInventory.length > 0) {
            const rootNode = dialogueTree[0];
            if (!rootNode.responses) rootNode.responses = [];
            
            // Avoid duplicate shop buttons
            if(!rootNode.responses.find(r => r.isShopButton)) {
                rootNode.responses.push({
                    text: "Show me your wares",
                    isShopButton: true,
                    action: (me, buyer) => {
                        this.openShopUI(buyer);
                        return false; // Stop dialogue, switch to shop UI
                    }
                });
            }
        }

        return dialogueTree;
    }

    /**
     * B"H
     * Opens a dynamic UI for purchasing items.
     */
    openShopUI(buyer) {
        const shopResponses = this.shopInventory.map((item, index) => ({
            text: `Buy ${item.name} (${item.price} coins) [${item.quantity} left]`,
            action: (me, buyer) => {
                this.sellItem(index, buyer);
            }
        }));

        shopResponses.push({ text: "Nevermind", close: "Come back soon!" });

        // Inject a temporary message node into the conversation
        // This uses the `changeResponseAndGoToIt` method on Medabeir
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
            // Remove empty item from inventory
            this.shopInventory.splice(index, 1);
            return;
        }

        // Check Buyer Funds (Assuming 'coin' in inventory)
        // This is a simplified check; for a robust game, use a proper wallet system
        const buyerInv = buyer.inventory;
        let hasFunds = false;
        // Find coins
        const coinSlot = buyerInv.slots.find(s => s && s.className === 'Coin');
        
        if (coinSlot && coinSlot.quantity >= item.price) {
            hasFunds = true;
            buyerInv.consumeItem(coinSlot, item.price);
        } else {
            // Check equipment or other slots? Assuming main slots for now.
        }

        if(!hasFunds) {
            this.ayshPeula("close dialogue", "You do not have enough Perutahs (coins).");
            return;
        }
        
        // Add Item to Buyer (Generic Item)
        // We construct a basic item from the shop data
        const itemToAdd = {
            id: item.name.toLowerCase().replace(/\s/g, "_") + "_" + Date.now(),
            name: item.name,
            className: "Brick", // Defaulting to generic object for now
            quantity: 1,
            description: "Bought from " + this.name
        };

        if(buyer.inventory) {
            buyer.inventory.addItem(itemToAdd);
        }

        // Decrement Stock
        item.quantity--;
        if (item.quantity <= 0) {
            this.shopInventory.splice(index, 1);
        }

        // Add Profit to Owner's Balance based on Contract
        const profit = item.price;
        const ownerShare = Math.floor(profit * (this.contractPercentage / 100));
        this.balance += ownerShare;
        
        // Log
        this.salesLog.push(`Sold ${item.name} for ${item.price} (Owner gets ${ownerShare}) at ${new Date().toLocaleTimeString()}`);

        this.ayshPeula("close dialogue", "Thank you for your purchase!");
    }

    /**
     * B"H
     * Serializes the soul's data to be preserved across sessions.
     */
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
        
        // Ensure we save the itemData wrapper so it can be re-instantiated correctly
        base.itemData = {
            id: this.name + "_" + Date.now(), // Unique ID
            className: "CustomNpc",
            name: this.name,
            customData: base.customData
        };
        return base;
    }
}